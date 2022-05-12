import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Env, isDevEnvironment } from './utils/env';

export const dataSource = new DataSource({
  type: 'postgres',
  synchronize: isDevEnvironment(),
  entities: [User],
  migrations: [],
  subscribers: [],
});

export async function setupDataSource(dataSource: DataSource) {
  return dataSource
    .setOptions({
      url: Env.DB_CONNECTION_STRING,
    })
    .initialize();
}

export async function purgeDataSource(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;
  const clearPromises = entities.map((entity) => dataSource.getRepository(entity.name).clear());
  await Promise.all(clearPromises);
}
