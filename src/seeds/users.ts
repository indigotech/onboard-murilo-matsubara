import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Address } from '../entities/address.entity';
import { User } from '../entities/user.entity';
import { toDateString } from '../utils/date';
import { hashPassword } from '../utils/password';

export async function seedUsersWithAddresses(userCount: number, dataSource: DataSource, addressesForEachUser: number) {
  return seedUsers(userCount, dataSource, addressesForEachUser);
}

export async function seedUsersWithoutAddress(userCount: number, dataSource: DataSource) {
  return seedUsers(userCount, dataSource, 0);
}

async function seedUsers(userCount: number, dataSource: DataSource, addressesForEachUser = 1) {
  const newUsers = await createRandomUsers(userCount);

  if (addressesForEachUser > 0) {
    for (const newUser of newUsers) {
      newUser.addresses = createRandomAddresses(addressesForEachUser);
    }
  }

  return await dataSource.manager.save(User, newUsers);
}

async function createRandomUsers(number: number) {
  return Promise.all(Array.from({ length: number }, () => randomUser()));
}

export async function randomUser(): Promise<User> {
  const user = new User();
  user.name = faker.name.findName();
  user.email = faker.internet.email();
  user.birthDate = toDateString(faker.date.between('1940-01-01', new Date()));
  user.password = await hashPassword(faker.internet.password());

  return user;
}

function createRandomAddresses(number: number) {
  return Array.from({ length: number }, () => randomAddress());
}

export function randomAddress(): Address {
  const address = new Address();
  address.city = faker.address.cityName();
  address.state = faker.address.state();
  address.street = faker.address.streetName();
  address.streetNumber = parseInt(faker.address.buildingNumber());
  address.complement = faker.address.secondaryAddress();
  address.neighborhood = faker.address.county();
  address.postalCode = faker.address.zipCode();

  return address;
}
