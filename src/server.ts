import { ApolloServerPluginDrainHttpServer, Config } from "apollo-server-core";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import express from "express";
import http from "http";

export async function startApolloServer(
	typeDefs: Config<ExpressContext>["typeDefs"],
	resolvers: Config<ExpressContext>["resolvers"],
	port: string | number = 4000,
	path: string = "/graphql"
) {
	// Initialize underlying http server
	const app = express();
	const httpServer = http.createServer(app);

	// Setup Apollo server interface
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	// Setup Apollo server path into express
	await server.start();
	server.applyMiddleware({
		app,
		path,
	});

	// Start http server
	httpServer.listen({ port });
}
