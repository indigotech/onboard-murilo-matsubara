import { config as makeDotenvAvailable } from "dotenv";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

// Make environment variables from `.env` available
makeDotenvAvailable();

// Graphql schema
const schema = buildSchema(`
type Query {
	hello: String
}
`);

// Graphql handler
const rootValue = {
	hello: () => "Hello world!",
};

// Config and initialize server
const PORT = process.env.APP_PORT || "4000";
const app = express();
app.use(
	"/graphql",
	graphqlHTTP({
		schema,
		rootValue,
		graphiql: true,
	})
);
app.listen(PORT);
console.log(`Graphql server is running on: http://localhost:${PORT}/graphql`);
