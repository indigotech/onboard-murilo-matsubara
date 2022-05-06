import { config as makeDotenvAvailable } from 'dotenv';
import { setupServer } from './server';

async function main() {
  makeDotenvAvailable();
  await setupServer();
}

main();
