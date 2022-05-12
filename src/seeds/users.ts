import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { toDateString } from '../utils/date';
import { hashPassword } from '../utils/password';

export async function seedUsers(userCount: number, dataSource: DataSource) {
  const newUsers = await createRandomUsers(userCount);

  return await dataSource.manager.save(User, newUsers);
}

async function createRandomUsers(number: number) {
  return Promise.all(Array.from({ length: number }, () => randomUser()));
}

async function randomUser(): Promise<User> {
  const user = new User();
  user.name = faker.name.findName();
  user.email = faker.internet.email();
  user.birthDate = toDateString(faker.date.between('1940-01-01', new Date()));
  user.password = await hashPassword(faker.internet.password());

  return user;
}
