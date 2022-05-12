import { QueryFailedError } from 'typeorm';
import { UNIQUE_CONSTRAINT_ERROR_CODE } from '../consts';
import { dataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { CustomValidationError } from '../exceptions/custom-validation-error';
import { InvalidLoginCredentials } from '../exceptions/invalid-login-credentials';
import { InvalidPassword } from '../exceptions/invalid-password';
import { signJwt, validateJwt } from '../utils/auth';
import { GraphqlContext } from '../utils/context';
import { Env } from '../utils/env';
import { checkPassword, hashPassword, isPasswordValid, rulesErrorMessage } from '../utils/password';

interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UsersQueryOptions {
  pageSize: number;
  skip: number;
  pageFirstUserId?: number;
}

export const userResolver = {
  Mutation: {
    createUser: async function (_: never, { user }: { user: User }, { jwt }: GraphqlContext) {
      validateJwt(jwt);

      validatePassword(user);
      user.password = await hashPassword(user.password);

      try {
        const newUser = await dataSource.manager.save(User, user);
        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          birthDate: newUser.birthDate,
        };
      } catch (error) {
        handleUserCreationError(error);
      }
    },

    login: async function (_: never, { credentials }: { credentials: Credentials }) {
      const matchingUser = await dataSource.manager.findOne(User, { where: { email: credentials.email } });

      if (!matchingUser) {
        throw new InvalidLoginCredentials();
      }

      const passwordMatch = await checkPassword(credentials.password, matchingUser.password);
      if (!passwordMatch) {
        throw new InvalidLoginCredentials();
      }
      const user = {
        id: matchingUser.id,
        name: matchingUser.name,
        email: matchingUser.email,
        birthDate: matchingUser.birthDate,
      };

      const token = signJwt(user, {
        expiresIn: credentials.rememberMe ? Env.JWT_REMEMBER_ME_EXPIRATION_TIME : Env.JWT_EXPIRATION_TIME,
      });

      return {
        user,
        token,
      };
    },
  },

  Query: {
    user: async (_: never, { id }: { id: number }, { jwt }: GraphqlContext) => {
      validateJwt(jwt);

      const user = await dataSource.manager.findOne(User, { where: { id } });
      if (!user) {
        throw new CustomValidationError(
          'User not found',
          `User with id ${id} not found in the database`,
          'UserNotFound',
        );
      }

      return user;
    },

    users: async (_: never, { options }: { options: UsersQueryOptions }, { jwt }: GraphqlContext) => {
      validateJwt(jwt);

      const [{ users, nextPageFirstUserId }, userCount, [firstUser]] = await Promise.all([
        paginatedUsers(options),
        dataSource.manager.count(User),
        dataSource.manager.find(User, { take: 1, order: { name: 'ASC', id: 'ASC' } }),
      ]);

      const hasPreviousPage = firstUser !== undefined && users[0].id !== firstUser.id;

      return {
        users,
        nextPageFirstUserId,
        userCount,
        hasPreviousPage,
      };
    },
  },
};

function validatePassword(user: User) {
  const { valid, brokenRules } = isPasswordValid(user.password);
  if (!valid) {
    throw new InvalidPassword(brokenRules, rulesErrorMessage);
  }
}

function handleUserCreationError(error: Error): never {
  if (error instanceof QueryFailedError && error.driverError.code == UNIQUE_CONSTRAINT_ERROR_CODE) {
    throw new CustomValidationError('Email is already in use', error.message, 'DuplicatedEmail');
  }

  throw error;
}

async function paginatedUsers(options: UsersQueryOptions) {
  // Fetch one more user to check if there are pages
  const users = await fetchPaginatedUsers({ ...options, pageSize: options.pageSize + 1 });
  const hasNextPage = users.length > options.pageSize;
  const pageLastIndex = users.length - 1;

  return {
    users: hasNextPage ? users.slice(0, pageLastIndex) : users,
    nextPageFirstUserId: hasNextPage ? users[pageLastIndex].id : undefined,
  };
}

async function fetchPaginatedUsers(options: UsersQueryOptions): Promise<User[]> {
  if (options.pageFirstUserId !== undefined) {
    return await dataSource.query(
      `select id, name, email, "birthDate"
      from public.user
      where (name, id) >= (
        select name, id
        from public.user
        where id = $3
      )
      order by name, id asc
      limit $1 offset $2`,
      [options.pageSize, options.skip, options.pageFirstUserId],
    );
  }
  return await dataSource.query(
    `select id, name, email, "birthDate"
      from public.user
      order by name, id asc
      limit $1 offset $2`,
    [options.pageSize, options.skip],
  );
}
