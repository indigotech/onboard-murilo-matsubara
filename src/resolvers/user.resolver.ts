import { QueryFailedError } from 'typeorm';
import { UNIQUE_CONSTRAINT_ERROR_CODE } from '../consts';
import { getDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { CustomValidationError } from '../exceptions/custom-validation-error';
import { InvalidLoginCredentials } from '../exceptions/invalid-login-credentials';
import { InvalidPassword } from '../exceptions/invalid-password';
import { checkPassword, hashPassword, isPasswordValid, rulesErrorMessage } from '../utils/password';

export const userResolver = {
  Mutation: {
    createUser: async function (_: never, { user }: { user: User }) {
      validatePassword(user);
      user.password = await hashPassword(user.password);

      try {
        const newUser = await getDataSource().manager.save(User, user);
        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          birthDate: newUser.birthDate,
        };
      } catch (error) {
        handleUserCreationError(error);
        return undefined;
      }
    },

    login: async function (_: never, { credentials }: { credentials: { email: string; password: string } }) {
      const matchingUser = await getDataSource().manager.findOne(User, { where: { email: credentials.email } });

      if (!matchingUser) {
        throw new InvalidLoginCredentials();
      }

      const passwordMatch = await checkPassword(credentials.password, matchingUser.password);
      if (!passwordMatch) {
        throw new InvalidLoginCredentials();
      }

      return {
        user: {
          id: matchingUser.id,
          name: matchingUser.name,
          email: matchingUser.email,
          birthDate: matchingUser.birthDate,
        },
        token: 'your_token',
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

function handleUserCreationError(error: Error) {
  if (error instanceof QueryFailedError && error.driverError.code == UNIQUE_CONSTRAINT_ERROR_CODE) {
    throw new CustomValidationError('Email is already in use', error.message, 'DuplicatedEmail');
  }

  throw error;
}
