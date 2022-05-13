import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Address } from './entities/address.entity';
import { User } from './entities/user.entity';
import { Env, isDevEnvironment } from './utils/env';

export const dataSource = new DataSource({
  type: 'postgres',
  synchronize: isDevEnvironment(),
  entities: [User, Address],
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
  const truncatePromises = entities
    .map((entity) => `${entity.connection.driver.schema}.${entity.tableName}`)
    .map((tableName) => dataSource.manager.query(`TRUNCATE ${tableName} CASCADE`));
  await Promise.all(truncatePromises);
}
