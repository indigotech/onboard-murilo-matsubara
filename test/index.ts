import assert from 'assert';
import axios from 'axios';
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
      { query: `query hello {\n  hello\n}`, variables: {} },
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    assert.deepEqual(response.data, expectedResponseData);
  });
});

after(() => {
  server.close();
});
