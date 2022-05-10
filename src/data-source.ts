import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Env, isDevEnvironment } from './utils/env';

export let dataSource: DataSource;
export async function setupDataSource() {
  dataSource = await new DataSource({
    type: 'postgres',
    url: Env.DB_CONNECTION_STRING,
    synchronize: isDevEnvironment(),
    entities: [User],
    migrations: [],
    subscribers: [],
  }).initialize();
}
