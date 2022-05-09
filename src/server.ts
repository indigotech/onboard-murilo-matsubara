import { ApolloServerPluginDrainHttpServer, Config } from 'apollo-server-core';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { DataSource } from 'typeorm';
import { getDataSource } from './data-source';
import { helloResolver } from './resolvers/hello.resolver';
import { userResolver } from './resolvers/user.resolver';
import { helloTypeDef } from './types/hello.type';
import { userTypeDef } from './types/user.type';
import { Env } from './utils/env';

export interface GraphqlContext {
  dataSource: DataSource;
}

export async function setupServer() {
  const server = await configAndInitilizeServer();
  return server;
}

async function configAndInitilizeServer() {
  const PORT = Env.APP_PORT;
  const PATH = Env.GRAPHQL_PATH;

  await getDataSource().initialize();

  const server = await startApolloServer([userTypeDef, helloTypeDef], [userResolver, helloResolver], PORT, PATH);

  console.log(`Graphql server is running on: http://localhost:${PORT}${PATH}`);
  return server;
}

export async function startApolloServer(
  typeDefs: Config<ExpressContext>['typeDefs'],
  resolvers: Config<ExpressContext>['resolvers'],
  port: string | number = 4000,
  path = '/graphql',
) {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({
    app,
    path,
  });

  httpServer.listen({ port });
  return httpServer;
}
