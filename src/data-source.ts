import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
    DEFAULT_POSTGRES_DB,
    DEFAULT_POSTGRES_HOST,
    DEFAULT_POSTGRES_PASSWORD,
    DEFAULT_POSTGRES_PORT,
    DEFAULT_POSTGRES_USER,
} from './consts';
import { isDevEnvironment, makeDotenvAvailable } from './utils/env';

makeDotenvAvailable();

export const appDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? DEFAULT_POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? DEFAULT_POSTGRES_PORT),
    username: process.env.POSTGRES_USER ?? DEFAULT_POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD ?? DEFAULT_POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? DEFAULT_POSTGRES_DB,
    synchronize: isDevEnvironment(),
    entities: ['dist/**/*.entity.js'],
    migrations: [],
    subscribers: [],
});
