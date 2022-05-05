import { ValidationError } from 'apollo-server-core';
import { appDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { isPasswordValid } from '../utils/password';

export const userResolver = {
  Mutation: {
    createUser: async function (_: never, { user }: { user: User }) {
      const { valid, brokenRules } = isPasswordValid(user.password);
      if (!valid) {
        throw new ValidationError(`Password: ${brokenRules}`);
      }

      const newUser = await appDataSource.manager.save(User, user);

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      };
    },
  },
};
