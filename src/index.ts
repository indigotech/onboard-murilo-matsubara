import { config as makeDotenvAvailable } from "dotenv";
import { helloResolver } from "./resolvers/hello.resolver";
import { startApolloServer } from "./server";
import { helloTypeDef } from "./types/hello.type";

async function main() {
	// Make environment variables from `.env` available
	makeDotenvAvailable();

	// Config and initialize server
	const PORT = process.env.APP_PORT || "4000";
	const PATH = process.env.GRAPHQL_PATH || "/graphql";

	await startApolloServer(helloTypeDef, helloResolver, PORT, PATH);

	console.log(
		`Graphql server is running on: http://localhost:${PORT}${PATH}`
	);
}

main();
