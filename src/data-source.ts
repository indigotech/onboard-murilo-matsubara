import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Env, isDevEnvironment } from './utils/env';

let dataSource: DataSource;
export function getDataSource() {
  if (dataSource === undefined) {
    dataSource = new DataSource({
      type: 'postgres',
      url: Env.DB_CONNECTION_STRING,
      synchronize: isDevEnvironment(),
      entities: ['dist/**/*.entity.js'],
      migrations: [],
      subscribers: [],
    });
  }
  return dataSource;
}
