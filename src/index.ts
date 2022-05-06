import { config as makeDotenvAvailable } from 'dotenv';
import { DEFAULT_GRAPHQL_PATH, DEFAULT_SERVER_PORT } from './consts';
import { helloResolver } from './resolvers/hello.resolver';
import { userResolver } from './resolvers/user.resolver';
import { startApolloServer } from './server';
import { helloTypeDef } from './types/hello.type';
import { userTypeDef } from './types/user.type';

async function main() {
  makeDotenvAvailable();
  configAndInitilizeServer();
}

async function configAndInitilizeServer() {
  const PORT = process.env.APP_PORT ?? DEFAULT_SERVER_PORT;
  const PATH = process.env.GRAPHQL_PATH ?? DEFAULT_GRAPHQL_PATH;

  await startApolloServer([userTypeDef, helloTypeDef], [userResolver, helloResolver], PORT, PATH);

  console.log(`Graphql server is running on: http://localhost:${PORT}${PATH}`);
}

main();
