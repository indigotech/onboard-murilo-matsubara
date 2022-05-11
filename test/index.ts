import { expect } from 'chai';
import { config as makeDotenvAvailable } from 'dotenv';
import { Server } from 'http';
import path from 'path';
import { getDataSource } from '../src/data-source';
import { User } from '../src/entities/user.entity';
import { setupServer } from '../src/server';
import { Env } from '../src/utils/env';
import { makeGraphqlResquest } from '../src/utils/graphql';
import { checkPassword } from '../src/utils/password';

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

    const response = await makeGraphqlResquest(
      TEST_SERVER_URL,
      `query hello {
        hello
      }`,
    );

    expect(response.data).to.be.deep.equal(expectedResponseData);
  });
});

describe('CreateUser mutation', () => {
  beforeEach(async () => {
    await getDataSource().manager.clear(User);
  });

  it('must create user sucessfully', async () => {
    const newUser = {
      name: 'Test',
      email: 'test@test.com',
      birthDate: '2000-01-01',
      password: 'test12',
    };

    const mutationResponse = await makeGraphqlResquest(
      TEST_SERVER_URL,
      `mutation CreateUser($user: UserInput) {
        createUser(user: $user) {
          id
          name
          email
          birthDate
        }
      }`,
      {
        user: newUser,
      },
    );
    const dbCreatedUser = await getDataSource().manager.findOne(User, { where: { id: mutationResponse.data.id } });
    const matchPassword = await checkPassword(newUser.password, dbCreatedUser?.password ?? '');

    expect(dbCreatedUser).to.not.be.undefined;
    expect(mutationResponse.data).to.be.deep.equal({
      data: {
        createUser: {
          name: newUser.name,
          email: newUser.email,
          birthDate: newUser.birthDate,
          id: dbCreatedUser?.id,
        },
      },
    });
    expect({
      name: dbCreatedUser?.name,
      email: dbCreatedUser?.email,
    }).to.be.deep.equal({
      name: newUser.name,
      email: newUser.email,
    });
    expect(new Date(dbCreatedUser?.birthDate ?? '').toDateString()).to.be.equals(
      new Date(newUser.birthDate).toDateString(),
    );
    expect(matchPassword).to.be.equal(true);
  });
});

after(() => {
  server.close();
});
