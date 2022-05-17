import { expect } from 'chai';
import { config as makeDotenvAvailable } from 'dotenv';
import { Server } from 'http';
import path from 'path';
import { setupServer } from '../src/server';
import { Env } from '../src/utils/env';
import { makeGraphqlResquest } from '../src/utils/graphql';
import { testUserEntity } from './user/entity.test';
import { testCreateUserMutation } from './user/mutations/create-user.test';
import { testLoginMutation } from './user/mutations/login.test';
import { testUserQuery } from './user/queries/user.test';
import { testUsersQuery } from './user/queries/users.test';

makeDotenvAvailable({ path: path.resolve(process.cwd(), 'test.env') });
let server: Server;
const TEST_SERVER_URL = `http://localhost:${Env.APP_PORT}${Env.GRAPHQL_PATH}`;

before(async () => {
  server = await setupServer();
});

describe('Hello query', () => {
  it('must return hello message', async () => {
    const expectedResponseData = { data: { hello: 'Hello world!' } };

    const response = await makeGraphqlResquest(
      TEST_SERVER_URL,
      `query hello {
        hello
      }`,
    );

    expect(response.data).to.be.deep.equal(expectedResponseData);
  });
});

testCreateUserMutation(TEST_SERVER_URL);
testLoginMutation(TEST_SERVER_URL);
testUserQuery(TEST_SERVER_URL);
testUsersQuery(TEST_SERVER_URL);
testUserEntity();

after(() => {
  server.close();
});
