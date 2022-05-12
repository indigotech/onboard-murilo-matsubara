import { gql } from 'apollo-server-core';
import { DEFAULT_USERS_QUERY_PAGE_SIZE } from '../consts';

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

  input Credentials {
    email: String
    password: String
    rememberMe: Boolean = false
  }

  type LoginResponse {
    user: User
    token: String
  }

  input UsersQueryOptions {
    pageSize: Int = ${DEFAULT_USERS_QUERY_PAGE_SIZE}
    skip: Int = 0
    pageFirstUserId: Int
  }

  type UsersQueryResponse {
    users: [User]
    userCount: Int
    nextPageFirstUserId: Int
    hasPreviousPage: Boolean
  }

  type Mutation {
    createUser(user: UserInput): User
    login(credentials: Credentials): LoginResponse
  }

  type Query {
    user(id: Int!): User
    users(options: UsersQueryOptions): UsersQueryResponse
  }
`;
