import { expect } from 'chai';
import { BAD_REQUEST_ERROR_CODE, UNAUTHORIZED_ERROR_CODE } from '../../../src/consts';
import { dataSource, purgeDataSource } from '../../../src/data-source';
import { Address } from '../../../src/entities/address.entity';
import { User } from '../../../src/entities/user.entity';
import { signJwt } from '../../../src/utils/auth';
import { makeGraphqlResquest } from '../../../src/utils/graphql';
import { hashPassword } from '../../../src/utils/password';

export const testUserQuery = (testServerUrl: string) => {
  describe('User query', () => {
    let onlyUser: User;
    let token: string;

    before(async () => {
      await purgeDataSource(dataSource);

      const address1 = new Address();
      address1.state = 'São Paulo';
      address1.city = 'São Paulo';
      address1.neighborhood = 'Sumaré';
      address1.postalCode = '01255-000';
      address1.street = 'Av. Dr. Arnaldo';
      address1.streetNumber = 2194;

      const address2: Address = { ...address1 };
      address2.complement = 'Taqtile';

      onlyUser = new User();
      onlyUser.name = 'Test';
      onlyUser.email = 'test@gmail.com';
      onlyUser.password = await hashPassword('test123');
      onlyUser.birthDate = '2000-01-01';
      onlyUser.addresses = [address1, address2];

      onlyUser = await dataSource.manager.save(onlyUser);
      token = signJwt({ id: onlyUser.id });
    });

    it('must return user data successfully', async () => {
      const queryResponse = await makeUserQueryRequest(onlyUser.id, token);

      expect(queryResponse.data.data.user).to.be.deep.equal({
        id: onlyUser.id,
        name: onlyUser.name,
        email: onlyUser.email,
        birthDate: onlyUser.birthDate,
        addresses: onlyUser.addresses,
      });
    });

    it('must return user not found error', async () => {
      const id = -1;

      const queryResponse = await makeUserQueryRequest(id, token);

      expect(queryResponse.data.errors).to.be.deep.equal([
        {
          code: BAD_REQUEST_ERROR_CODE,
          name: 'UserNotFound',
          message: 'User not found',
          additionalInfo: `User with id ${id} not found in the database`,
        },
      ]);
    });

    it('must return unauthorized error', async () => {
      const id = 1;

      const queryResponse = await makeUserQueryRequest(id);

      expect(queryResponse.data.errors).to.be.deep.equal([
        {
          code: UNAUTHORIZED_ERROR_CODE,
          message: 'You must be logged in',
          additionalInfo: 'No jwt token was provided in the Authorization header',
          name: 'NoJwtToken',
        },
      ]);
    });

    after(async () => {
      await purgeDataSource(dataSource);
    });

    function makeUserQueryRequest(id: number, token?: string) {
      return makeGraphqlResquest(
        testServerUrl,
        `query User($id: Int!) {
              user(id: $id) {
                id
                name
                email
                birthDate
                addresses {
                  id
                  street
                  streetNumber
                  complement
                  neighborhood
                  postalCode
                  city
                  state
                }
              }
            }`,
        { id },
        token,
      );
    }
  });
};
