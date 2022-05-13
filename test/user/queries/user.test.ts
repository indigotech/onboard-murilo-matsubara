import { expect } from 'chai';
import { BAD_REQUEST_ERROR_CODE, UNAUTHORIZED_ERROR_CODE } from '../../../src/consts';
import { dataSource, purgeDataSource } from '../../../src/data-source';
import { User } from '../../../src/entities/user.entity';
import { signJwt } from '../../../src/utils/auth';
import { makeGraphqlResquest } from '../../../src/utils/graphql';
import { hashPassword } from '../../../src/utils/password';

export const userTests = (testServerUrl: string) => {
  describe('User query', () => {
    let onlyUser: User;
    let token: string;
    let onlyUserPayload: { id: number; name: string; email: string; birthDate: string };

    before(async () => {
      await purgeDataSource(dataSource);

      onlyUser = new User();
      onlyUser.name = 'Test';
      onlyUser.email = 'test@gmail.com';
      onlyUser.password = await hashPassword('test123');
      onlyUser.birthDate = '2000-01-01';
      onlyUser = await dataSource.manager.save(onlyUser);

      onlyUserPayload = {
        id: onlyUser.id,
        name: onlyUser.name,
        email: onlyUser.email,
        birthDate: onlyUser.birthDate,
      };
      token = signJwt(onlyUserPayload);
    });

    it('must return user data successfully', async () => {
      const queryResponse = await makeUserQueryRequest(onlyUser.id, token);

      expect(queryResponse.data.data.user).to.be.deep.equal(onlyUserPayload);
    });

    it('must return user not found error', async () => {
      const id = 1;

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
              }
            }`,
        { id },
        token,
      );
    }
  });
};
