import { config as makeDotenvAvailable } from 'dotenv';
import { dataSource, setupDataSource } from '../data-source';
import { seedUsers } from './users';

async function seed() {
  makeDotenvAvailable();
  console.log('Setting up data source...');
  await setupDataSource(dataSource);

  console.log('Seeding users...');
  await seedUsers(50, dataSource);
  console.log('Seeding completed!');
}

seed();
