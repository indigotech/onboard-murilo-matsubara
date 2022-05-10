import { expect } from 'chai';
import { dataSource } from '../../src/data-source';
import { User } from '../../src/entities/user.entity';
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

      expect(mutationResponse.data.errors).to.be.undefined;
      expect(mutationResponse.data.data.login.token).to.not.be.undefined;
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

      expect(mutationResponse.data.errors[0].name).to.be.equal('InvalidLoginCredentials');
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

      expect(mutationResponse.data.errors[0].name).to.be.equal('InvalidLoginCredentials');
    });

    interface Credentials {
      email: string;
      password: string;
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
