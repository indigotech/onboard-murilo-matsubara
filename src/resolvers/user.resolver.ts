import { appDataSource } from '../data-source';
import { User } from '../entities/user.entity';

export const userResolver = {
  Mutation: {
    createUser: async function (_: never, { user }: { user: User }) {
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
