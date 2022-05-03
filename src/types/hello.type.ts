import { gql } from "apollo-server-core";

export const helloTypeDef = gql`
	type Query {
		hello: String
	}
`;
