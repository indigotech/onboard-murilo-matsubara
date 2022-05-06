import assert from 'assert';
import axios from 'axios';
import { Server } from 'http';
import { setupServer } from '../src/server';

let server: Server;
const TEST_SERVER_PORT = '7890';
const TEST_SERVER_HOST = 'localhost';
const TEST_SERVER_GRAPHQL_PATH = '/graphql';
const TEST_SERVER_URL = `http://${TEST_SERVER_HOST}:${TEST_SERVER_PORT}${TEST_SERVER_GRAPHQL_PATH}`;

before(async () => {
  process.env.APP_PORT = TEST_SERVER_PORT;
  process.env.GRAPHQL_PATH = TEST_SERVER_GRAPHQL_PATH;
  server = await setupServer();
});

describe('Test hello query', () => {
  it('test', async () => {
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
