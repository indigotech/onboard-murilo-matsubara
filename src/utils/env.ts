import { EnvironmentVariableNotFound } from '../exceptions/env-var-not-found';

export const isDevEnvironment = () => process.env.NODE_ENV !== 'production';

export class Env {
  static get APP_PORT() {
    if (!process.env.APP_PORT) {
      throw new EnvironmentVariableNotFound('APP_PORT');
    }
    return process.env.APP_PORT;
  }

  static get GRAPHQL_PATH() {
    if (!process.env.GRAPHQL_PATH) {
      throw new EnvironmentVariableNotFound('GRAPHQL_PATH');
    }
    return process.env.GRAPHQL_PATH;
  }

  static get DB_CONNECTION_STRING() {
    if (!process.env.DB_CONNECTION_STRING) {
      throw new EnvironmentVariableNotFound('CONNECTION_STRING');
    }
    return process.env.DB_CONNECTION_STRING;
  }

  static get PASSWORD_KEY_LENGTH() {
    if (!process.env.PASSWORD_KEY_LENGTH) {
      throw new EnvironmentVariableNotFound('PASSWORD_KEY_LENGTH');
    }
    return parseInt(process.env.PASSWORD_KEY_LENGTH);
  }

  static get JWT_SECRET() {
    if (!process.env.JWT_SECRET) {
      throw new EnvironmentVariableNotFound('JWT_SECRET');
    }
    return process.env.JWT_SECRET;
  }

  static get JWT_EXPIRATION_TIME() {
    if (!process.env.JWT_EXPIRATION_TIME) {
      throw new EnvironmentVariableNotFound('JWT_EXPIRATION_TIME');
    }
    return parseInt(process.env.JWT_EXPIRATION_TIME);
  }
}
