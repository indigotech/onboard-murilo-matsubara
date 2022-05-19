import { config as makeDotenvAvailable } from 'dotenv';
import { dataSource, setupDataSource } from '../data-source';
import { seedUsersWithAddresses } from './users';

async function seed() {
  makeDotenvAvailable();
  console.log('Setting up data source...');
  await setupDataSource(dataSource);

  console.log('Seeding users...');
  await seedUsersWithAddresses(50, dataSource, 1);
  console.log('Seeding completed!');
}

seed();
