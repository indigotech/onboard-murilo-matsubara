import assert from 'assert';
import axios from 'axios';
import { config as makeDotenvAvailable } from 'dotenv';
import { Server } from 'http';
import path from 'path';
import { setupServer } from '../src/server';

let server: Server;
let TEST_SERVER_URL: string;

before(async () => {
  makeDotenvAvailable({ path: path.resolve(process.cwd(), 'test.env') });
  TEST_SERVER_URL = `http://localhost:${process.env.APP_PORT}${process.env.GRAPHQL_PATH}`;
  server = await setupServer();
});

describe('Graphql queries', () => {
  it('Test hello query', async () => {
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
