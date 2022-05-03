import { config } from 'dotenv';

export const isDevEnvironment = () => process.env.NODE_ENV !== 'production';
export const makeDotenvAvailable = config;
