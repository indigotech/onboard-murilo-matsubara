import axios from 'axios';
import { expect } from 'chai';
import { config as makeDotenvAvailable } from 'dotenv';
import { Server } from 'http';
import path from 'path';
import { setupServer } from '../src/server';
import { Env } from '../src/utils/env';

let server: Server;
let TEST_SERVER_URL: string;

before(async () => {
  makeDotenvAvailable({ path: path.resolve(process.cwd(), 'test.env') });
  TEST_SERVER_URL = `http://localhost:${Env.APP_PORT}${Env.GRAPHQL_PATH}`;
  server = await setupServer();
});

describe('Hello query', () => {
  it('must return hello message', async () => {
    const expectedResponseData = { data: { hello: 'Hello world!' } };

    const response = await axios.post(
      TEST_SERVER_URL,
      {
        query: `
        query hello {
          hello
        }`,
        variables: {},
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    expect(response.data).to.be.deep.equal(expectedResponseData);
  });
});

describe('CreateUser mutation', () => {
  it('must create user sucessfully', async () => {
    const userToCreate = {
      name: 'Test',
      email: 'test@test.com',
      birthDate: '01/01/2000',
    };
    const expectedResponseData = {
      data: {
        createUser: {
          id: 1,
          ...userToCreate,
        },
      },
    };

    const response = await axios.post(
      TEST_SERVER_URL,
      {
        query: `
        mutation CreateUser($user: UserInput) {
          createUser(user: $user) {
            id
            name
            email
            birthDate
          }
        }`,
        variables: {
          user: {
            ...userToCreate,
            password: 'test12',
          },
        },
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    expect(response.data).to.be.deep.equal(expectedResponseData);
  });
});

after(() => {
  server.close();
});
