import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { BAD_REQUEST_ERROR_CODE } from '../../src/consts';
import { dataSource } from '../../src/data-source';
import { User } from '../../src/entities/user.entity';
import { Env } from '../../src/utils/env';
import { makeGraphqlResquest } from '../../src/utils/graphql';
import { hashPassword } from '../../src/utils/password';

export const loginTests = (testServerUrl: string) => {
  describe('Login mutation', () => {
    beforeEach(async () => {
      await dataSource.manager.clear(User);
    });

    it('must login sucessfully', async () => {
      const unhashedPassword = 'test123';

      const user = new User();
      user.birthDate = '2000-01-01';
      user.email = 'test@test.com';
      user.name = 'Test';

      user.password = await hashPassword(unhashedPassword);
      const { id } = await dataSource.manager.save(User, user);

      const mutationResponse = await makeLoginMutationRequest({ email: user.email, password: unhashedPassword });
      const tokenPayload = jwt.verify(mutationResponse.data.data.login.token, Env.JWT_SECRET) as jwt.JwtPayload;
      const tokenDuration = tokenPayload.exp - tokenPayload.iat;

      expect(mutationResponse.data.errors).to.be.undefined;
      expect(tokenPayload.id).to.be.equal(id);
      expect(tokenPayload.name).to.be.equal(user.name);
      expect(tokenPayload.email).to.be.equal(user.email);
      expect(tokenPayload.birthDate).to.be.equal(user.birthDate);
      expect(tokenDuration).to.be.equal(Env.JWT_EXPIRATION_TIME);
      expect(mutationResponse.data.data.login.user).to.be.deep.equal({
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        id,
      });
    });

    it('must login succefully with longer expiry date when rememberMe is true', async () => {
      const unhashedPassword = 'test123';

      const user = new User();
      user.birthDate = '2000-01-01';
      user.email = 'test@test.com';
      user.name = 'Test';

      user.password = await hashPassword(unhashedPassword);
      const { id } = await dataSource.manager.save(User, user);

      const mutationResponse = await makeLoginMutationRequest({
        email: user.email,
        password: unhashedPassword,
        rememberMe: true,
      });
      const tokenPayload = jwt.verify(mutationResponse.data.data.login.token, Env.JWT_SECRET) as jwt.JwtPayload;
      const tokenDuration = tokenPayload.exp - tokenPayload.iat;

      expect(mutationResponse.data.errors).to.be.undefined;
      expect(tokenPayload.id).to.be.equal(id);
      expect(tokenPayload.name).to.be.equal(user.name);
      expect(tokenPayload.email).to.be.equal(user.email);
      expect(tokenPayload.birthDate).to.be.equal(user.birthDate);
      expect(tokenDuration).to.be.equal(Env.JWT_REMEMBER_ME_EXPIRATION_TIME);
      expect(mutationResponse.data.data.login.user).to.be.deep.equal({
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        id,
      });
    });

    it('must return invalid credentials error (email not registered)', async () => {
      const credentials = { email: 'test@test.com', password: 'test123' };

      const mutationResponse = await makeLoginMutationRequest(credentials);

      expect(mutationResponse.data.errors[0]).to.be.deep.equal({
        code: BAD_REQUEST_ERROR_CODE,
        message: 'Invalid email or password',
        additionalInfo: 'No user with a matching email and password was found',
        name: 'InvalidLoginCredentials',
      });
    });

    it('must return invalid credentials error (wrong password)', async () => {
      const correctPassword = 'test123';
      const passwordTried = 'test1234';

      const user = new User();
      user.birthDate = '2000-01-01';
      user.email = 'test@test.com';
      user.name = 'Test';

      user.password = await hashPassword(correctPassword);
      await dataSource.manager.save(User, user);

      const mutationResponse = await makeLoginMutationRequest({ email: user.email, password: passwordTried });

      expect(mutationResponse.data.errors[0]).to.be.deep.equal({
        code: BAD_REQUEST_ERROR_CODE,
        message: 'Invalid email or password',
        additionalInfo: 'No user with a matching email and password was found',
        name: 'InvalidLoginCredentials',
      });
    });

    interface Credentials {
      email: string;
      password: string;
      rememberMe?: boolean;
    }

    function makeLoginMutationRequest(credentials: Credentials) {
      return makeGraphqlResquest(
        testServerUrl,
        `mutation Login($credentials: Credentials) {
          login(credentials: $credentials) {
            user {
              id
              name
              email
              birthDate
            }
            token
          }
        }`,
        { credentials },
      );
    }
  });
};
