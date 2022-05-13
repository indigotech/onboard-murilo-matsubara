import { expect } from 'chai';
import { config as makeDotenvAvailable } from 'dotenv';
import { Server } from 'http';
import path from 'path';
import { setupServer } from '../src/server';
import { Env } from '../src/utils/env';
import { makeGraphqlResquest } from '../src/utils/graphql';
import { createUserTests } from './user/create-user.test';
import { loginTests } from './user/login.test';

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

describe('CreateUser mutation', createUserTests(TEST_SERVER_URL));
describe('Login mutation', loginTests(TEST_SERVER_URL));

after(() => {
  server.close();
});
