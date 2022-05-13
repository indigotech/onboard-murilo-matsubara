import { expect } from 'chai';
import { dataSource, purgeDataSource } from '../../src/data-source';
import { Address } from '../../src/entities/address.entity';
import { User } from '../../src/entities/user.entity';
import { hashPassword } from '../../src/utils/password';

export const testUserEntity = () => {
  describe('User entity', () => {
    before(async () => {
      await purgeDataSource(dataSource);
    });

    it('must create an user with 2 addresses', async () => {
      const address1 = new Address();
      address1.state = 'São Paulo';
      (address1.city = 'São Paulo'), (address1.neighborhood = 'Sumaré');
      address1.postalCode = '01255-000';
      address1.street = 'Av. Dr. Arnaldo';
      address1.streetNumber = 2194;

      const address2: Address = { ...address1 };
      address2.complement = 'Taqtile';

      const user = new User();
      user.name = 'Test';
      user.email = 'test@test.com';
      user.birthDate = '2000-01-01';
      user.password = await hashPassword('test123');
      user.addresses = [address1, address2];

      const { id: userId } = await dataSource.manager.save(User, user);
      const createdUser = await dataSource.manager.findOne(User, {
        where: { id: userId },
        relations: { addresses: true },
      });

      expect(createdUser).to.be.deep.equal(user);
    });
  });
};
