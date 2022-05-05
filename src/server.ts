import { ApolloServerPluginDrainHttpServer, Config } from 'apollo-server-core';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { DataSource } from 'typeorm';

export interface GraphqlContext {
  dataSource: DataSource;
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
}
