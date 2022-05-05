import { gql } from 'apollo-server-core';

export const userTypeDef = gql`
  input UserInput {
    name: String
    email: String
    password: String
    birthDate: String
  }

  type User {
    id: Int
    name: String
    email: String
    birthDate: String
  }

  type Mutation {
    createUser(user: UserInput): User
  }
`;