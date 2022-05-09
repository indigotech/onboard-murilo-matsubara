import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Env, isDevEnvironment } from './utils/env';

export function getDataSource() {
  return new DataSource({
    type: 'postgres',
    url: Env.DB_CONNECTION_STRING,
    synchronize: isDevEnvironment(),
    entities: ['dist/**/*.entity.js'],
    migrations: [],
    subscribers: [],
  });
}
