export const userResolver = {
  Mutation: {
    createUser: async (_: never, { user }: { user: { name: string; email: string; birthDate: string } }) => ({
      id: 1,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
    }),
  },
};
