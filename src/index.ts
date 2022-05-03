import { config as makeDotenvAvailable } from 'dotenv';
import { DEFAULT_GRAPHQL_PATH, DEFAULT_SERVER_PORT } from './consts';
import { appDataSource } from './data-source';
import { User } from './entities/user.entity';
import { helloResolver } from './resolvers/hello.resolver';
import { startApolloServer } from './server';
import { helloTypeDef } from './types/hello.type';

async function main() {
<<<<<<< HEAD
  makeDotenvAvailable();
  configAndInitilizeServer();
  testDbUser();
=======
    makeDotenvAvailable();
    configAndInitilizeServer();
    insertTestDbUser();
>>>>>>> Renamed test db function
}

async function configAndInitilizeServer() {
  const PORT = process.env.APP_PORT ?? DEFAULT_SERVER_PORT;
  const PATH = process.env.GRAPHQL_PATH ?? DEFAULT_GRAPHQL_PATH;

  await startApolloServer(helloTypeDef, helloResolver, PORT, PATH);

  console.log(`Graphql server is running on: http://localhost:${PORT}${PATH}`);
}

async function testDbUser() {
  const dataSource = await appDataSource.initialize();

  const user = new User();
  user.firstName = 'Testandinho';
  user.lastName = 'da Silva';
  user.age = 99;

  const savedUser = await dataSource.manager.save(user);

  const fetchedUser = await dataSource.manager.findOne(User, { where: { id: savedUser.id } });
  console.log(`User ${fetchedUser?.firstName} ${fetchedUser?.lastName} has been created. ID: ${fetchedUser?.id}`);
}

main();
