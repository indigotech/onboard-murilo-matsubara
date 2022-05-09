import { ValidationError } from 'apollo-server-core';
import { QueryFailedError } from 'typeorm';
import { UNIQUE_CONSTRAINT_ERROR_CODE } from '../consts';
import { appDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { hashPassword, isPasswordValid } from '../utils/password';

export const userResolver = {
  Mutation: {
    createUser: async function (_: never, { user }: { user: User }) {
      validatePassword(user);
      user.password = await hashPassword(user.password);

      try {
        const newUser = await appDataSource.manager.save(User, user);
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
    throw new ValidationError(`Password: ${brokenRules}`);
  }
}

function handleUserCreationError(error: Error) {
  if (error instanceof QueryFailedError && error.driverError.code == UNIQUE_CONSTRAINT_ERROR_CODE) {
    throw new ValidationError('Email is already used.');
  }

  throw error;
}
