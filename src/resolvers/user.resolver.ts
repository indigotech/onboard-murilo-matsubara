import { User } from '../entities/user.entity';
import { GraphqlContext } from '../server';

export const userResolver = {
  Mutation: {
    createUser: async function (_: never, { user }: { user: User }, { dataSource }: GraphqlContext) {
      const newUser = await dataSource.manager.save(User, user);

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      };
    },
  },
};
