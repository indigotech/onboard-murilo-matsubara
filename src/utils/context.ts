import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express';
import { extractJwtFromRequest } from './auth';

export interface GraphqlContext {
  jwt: string | undefined;
}

export const context: ContextFunction<ExpressContext, GraphqlContext> = (expressContext) => ({
  jwt: extractJwtFromRequest(expressContext.req),
});
