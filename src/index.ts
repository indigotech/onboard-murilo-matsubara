import { config as makeDotenvAvailable } from 'dotenv';
import { DEFAULT_GRAPHQL_PATH, DEFAULT_SERVER_PORT } from './consts';
import { helloResolver } from './resolvers/hello.resolver';
import { startApolloServer } from './server';
import { helloTypeDef } from './types/hello.type';

async function main() {
  makeDotenvAvailable();
  configAndInitilizeServer();
}

<<<<<<< HEAD
async function configAndInitilizeServer() {
  const PORT = process.env.APP_PORT || '4000';
  const PATH = process.env.GRAPHQL_PATH || '/graphql';
=======
  // Config and initialize server
  const PORT = process.env.APP_PORT || DEFAULT_SERVER_PORT;
  const PATH = process.env.GRAPHQL_PATH || DEFAULT_GRAPHQL_PATH;
>>>>>>> Extracted project constants to a separate file

  await startApolloServer(helloTypeDef, helloResolver, PORT, PATH);

  console.log(`Graphql server is running on: http://localhost:${PORT}${PATH}`);
}

main();
