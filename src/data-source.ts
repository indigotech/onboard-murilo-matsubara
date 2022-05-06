import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { isDevEnvironment } from './utils/env';

if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_DATABASE
) {
  throw new ReferenceError(
    'Could not find one of the required variables inside of `.env`. Check `README.md` for more instructions.',
  );
}

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: isDevEnvironment(),
  entities: ['dist/**/*.entity.js'],
  migrations: [],
  subscribers: [],
});
