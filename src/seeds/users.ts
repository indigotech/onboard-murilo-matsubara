import { faker } from '@faker-js/faker';
import { config as makeDotenvAvailable } from 'dotenv';
import { dataSource, setupDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { hashPassword } from '../utils/password';

async function seed() {
  makeDotenvAvailable();
  await setupDataSource();

  const userToCreate = 50;
  const newUsers = await createRandomUsers(userToCreate);

  await dataSource.manager.save(User, newUsers);
}

async function createRandomUsers(number: number) {
  return Promise.all(Array.from({ length: number }, () => randomUser()));
}

async function randomUser(): Promise<User> {
  const user = new User();
  user.name = faker.name.findName();
  user.email = faker.internet.email();
  user.birthDate = faker.date.between('1940-01-01', new Date()).toISOString().slice(0, 10);
  user.password = await hashPassword(faker.internet.password());

  console.log(user);

  return user;
}

seed();
