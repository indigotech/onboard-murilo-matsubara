import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Env, isDevEnvironment } from './utils/env';

let dataSource: DataSource;
export function getDataSource() {
  if (dataSource === undefined) {
    dataSource = new DataSource({
      type: 'postgres',
      url: Env.DB_CONNECTION_STRING,
      synchronize: isDevEnvironment(),
      entities: [User],
      migrations: [],
      subscribers: [],
    });
  }
  return dataSource;
}
