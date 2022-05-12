import { expect } from 'chai';
import { BAD_REQUEST_ERROR_CODE, UNAUTHORIZED_ERROR_CODE } from '../../../src/consts';
import { dataSource, purgeDataSource } from '../../../src/data-source';
import { User } from '../../../src/entities/user.entity';
import { signJwt } from '../../../src/utils/auth';
import { makeGraphqlResquest } from '../../../src/utils/graphql';
import { checkPassword, rulesErrorMessage } from '../../../src/utils/password';

export const createUserTests = (testServerUrl: string) => {
  describe('CreateUser mutation', () => {
    beforeEach(async () => {
      await purgeDataSource(dataSource);
    });

    it('must create user sucessfully', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test12',
      };
      const token = signJwt({ name: newUser.name, email: newUser.email, birthDate: newUser.birthDate });

      const mutationResponse = await makeUserMutationRequest(newUser, token);
      const dbCreatedUser = await dataSource.manager.findOne(User, { where: { id: mutationResponse.data.id } });
      const matchPassword = await checkPassword(newUser.password, dbCreatedUser.password);

      expect(mutationResponse.data).to.be.deep.equal({
        data: {
          createUser: {
            name: newUser.name,
            email: newUser.email,
            birthDate: newUser.birthDate,
            id: dbCreatedUser.id,
          },
        },
      });
      expect(dbCreatedUser.name).to.be.equal(newUser.name);
      expect(dbCreatedUser.email).to.be.equal(newUser.email);
      expect(dbCreatedUser.birthDate).to.be.equals(newUser.birthDate);
      expect(matchPassword).to.be.equal(true);
    });

    it('must return duplicated email error', async () => {
      const newUser = new User();
      newUser.birthDate = '2000-01-01';
      newUser.email = 'test@gmail.com';
      newUser.name = 'Test';
      newUser.password = 'Test123!';
      const token = signJwt({ name: newUser.name, email: newUser.email, birthDate: newUser.birthDate });
      await dataSource.manager.insert(User, newUser);

      const mutationResponse = await makeUserMutationRequest(
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          birthDate: newUser.birthDate,
        },
        token,
      );
      const { name, message, code } = mutationResponse.data.errors[0];

      expect(name).to.be.equal('DuplicatedEmail');
      expect(message).to.be.equal('Email is already in use');
      expect(code).to.be.equal(BAD_REQUEST_ERROR_CODE);
    });

    it('must return invalid password error (minimun length)', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test1',
      };
      const token = signJwt({ name: newUser.name, email: newUser.email, birthDate: newUser.birthDate });

      const mutationResponse = await makeUserMutationRequest(
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          birthDate: newUser.birthDate,
        },
        token,
      );
      const { name, message, additionalInfo, code } = mutationResponse.data.errors[0];

      expect(name).to.be.equal('InvalidPassword');
      expect(message).to.be.equal('Invalid password');
      expect(code).to.be.equal(BAD_REQUEST_ERROR_CODE);
      expect(additionalInfo).to.contain(rulesErrorMessage['min_length']);
    });

    it('must return invalid password error (one letter required)', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: '12345678',
      };
      const token = signJwt({ name: newUser.name, email: newUser.email, birthDate: newUser.birthDate });

      const mutationResponse = await makeUserMutationRequest(
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          birthDate: newUser.birthDate,
        },
        token,
      );
      const { name, message, additionalInfo, code } = mutationResponse.data.errors[0];

      expect(name).to.be.equal('InvalidPassword');
      expect(message).to.be.equal('Invalid password');
      expect(code).to.be.equal(BAD_REQUEST_ERROR_CODE);
      expect(additionalInfo).to.contain(rulesErrorMessage['contain_letter']);
    });

    it('must return invalid password error (one digit required)', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'testtest',
      };
      const token = signJwt({ name: newUser.name, email: newUser.email, birthDate: newUser.birthDate });

      const mutationResponse = await makeUserMutationRequest(
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          birthDate: newUser.birthDate,
        },
        token,
      );
      const { name, message, additionalInfo, code } = mutationResponse.data.errors[0];

      expect(name).to.be.equal('InvalidPassword');
      expect(message).to.be.equal('Invalid password');
      expect(code).to.be.equal(BAD_REQUEST_ERROR_CODE);
      expect(additionalInfo).to.contain(rulesErrorMessage['contain_digit']);
    });

    it('must return no jwt token error', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test12',
      };

      const mutationResponse = await makeUserMutationRequest(newUser);

      expect(mutationResponse.data.errors[0]).to.be.deep.equal({
        code: UNAUTHORIZED_ERROR_CODE,
        message: 'You must be logged in',
        additionalInfo: 'No jwt token was provided in the Authorization header',
        name: 'NoJwtToken',
      });
    });

    it('must return invalid jwt token error', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test12',
      };
      const token =
        'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzAsIm5hbWUiOiJNdXJpbG8iLCJlbWFpbCI6Im11cmlsby5tYXRzdWJhcmFAZ21haWwuY29tIiwiYmlydGhEYXRlIjoiMTk5OC0xMC0wNSIsImlhdCI6MTY1MjE4Njg4OSwiZXhwIjoxNjUyMTg3MTg5fQ.CaHXfzrpeyMST5WYcXrfWCE4aEp-PGxGNfaLM0uFiX4';

      const mutationResponse = await makeUserMutationRequest(newUser, token);

      expect(mutationResponse.data.errors[0]).to.be.deep.equal({
        code: UNAUTHORIZED_ERROR_CODE,
        message: 'You must be logged in',
        additionalInfo: 'Invalid jwt token',
        name: 'InvalidJwtToken',
      });
    });

    it('must return expired jwt token error', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test12',
      };
      const token = signJwt(
        { name: newUser.name, email: newUser.email, birthDate: newUser.birthDate },
        { expiresIn: -1 },
      );

      const mutationResponse = await makeUserMutationRequest(newUser, token);

      expect(mutationResponse.data.errors[0]).to.be.deep.equal({
        code: UNAUTHORIZED_ERROR_CODE,
        message: 'Login expired',
        additionalInfo: 'Jwt token is expired',
        name: 'JwtTokenExpired',
      });
    });

    interface UserMutationInput {
      name: string;
      birthDate: string;
      email: string;
      password: string;
    }

    function makeUserMutationRequest(user: UserMutationInput, jwtToken?: string) {
      return makeGraphqlResquest(
        testServerUrl,
        `mutation CreateUser($user: UserInput) {
          createUser(user: $user) {
            id
            name
            email
            birthDate
          }
        }`,
        { user },
        jwtToken,
      );
    }
  });
};
