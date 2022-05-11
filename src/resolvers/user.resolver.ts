import { ValidationError } from 'apollo-server-core';
import { QueryFailedError } from 'typeorm';
import { UNIQUE_CONSTRAINT_ERROR_CODE } from '../consts';
import { getDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { InvalidPassword } from '../exceptions/invalid-password';
import { hashPassword, isPasswordValid, rulesErrorMessage } from '../utils/password';

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
  },
};

function validatePassword(user: User) {
  const { valid, brokenRules } = isPasswordValid(user.password);
  if (!valid) {
    throw new InvalidPassword(`Password: ${brokenRules.map((rule) => rulesErrorMessage[rule])}`);
  }
}

function handleUserCreationError(error: Error) {
  if (error instanceof QueryFailedError && error.driverError.code == UNIQUE_CONSTRAINT_ERROR_CODE) {
    throw new ValidationError('Email is already used.');
  }

  throw error;
}
