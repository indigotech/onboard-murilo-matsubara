import { config as makeDotenvAvailable } from 'dotenv';
import { DEFAULT_GRAPHQL_PATH, DEFAULT_SERVER_PORT } from './consts';
import { helloResolver } from './resolvers/hello.resolver';
import { startApolloServer } from './server';
import { helloTypeDef } from './types/hello.type';

async function main() {
    makeDotenvAvailable();
    configAndInitilizeServer();
}

async function configAndInitilizeServer() {
    const PORT = process.env.APP_PORT ?? DEFAULT_SERVER_PORT;
    const PATH = process.env.GRAPHQL_PATH ?? DEFAULT_GRAPHQL_PATH;

    await startApolloServer(helloTypeDef, helloResolver, PORT, PATH);

    console.log(`Graphql server is running on: http://localhost:${PORT}${PATH}`);
}

main();
