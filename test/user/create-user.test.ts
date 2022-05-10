import { expect } from 'chai';
import { dataSource } from '../../src/data-source';
import { User } from '../../src/entities/user.entity';
import { makeGraphqlResquest } from '../../src/utils/graphql';
import { checkPassword, rulesErrorMessage } from '../../src/utils/password';

export const createUserTests = (testServerUrl: string) => {
  describe('CreateUser mutation', () => {
    beforeEach(async () => {
      await dataSource.manager.clear(User);
    });

    it('must create user sucessfully', async () => {
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test12',
      };

      const mutationResponse = await makeUserMutationRequest(newUser);
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
      const expectedErrorName = 'DuplicatedEmail';
      const newUser = new User();
      newUser.birthDate = '2000-01-01';
      newUser.email = 'test@gmail.com';
      newUser.name = 'Test';
      newUser.password = 'Test123!';

      await dataSource.manager.insert(User, newUser);
      const mutationResponse = await makeUserMutationRequest({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        birthDate: newUser.birthDate,
      });

      expect(mutationResponse.data.errors[0].name).to.be.equal(expectedErrorName);
    });

    it('must return invalid password error (minimun length)', async () => {
      const expectedErrorName = 'InvalidPassword';
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'test1',
      };

      const mutationResponse = await makeUserMutationRequest({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        birthDate: newUser.birthDate,
      });

      expect(mutationResponse.data.errors[0].name).to.be.equal(expectedErrorName);
      expect(mutationResponse.data.errors[0].additionalInfo).to.contain(rulesErrorMessage['min_length']);
    });

    it('must return invalid password error (one letter required)', async () => {
      const expectedErrorName = 'InvalidPassword';
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: '12345678',
      };

      const mutationResponse = await makeUserMutationRequest({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        birthDate: newUser.birthDate,
      });

      expect(mutationResponse.data.errors[0].name).to.be.equal(expectedErrorName);
      expect(mutationResponse.data.errors[0].additionalInfo).to.contain(rulesErrorMessage['contain_letter']);
    });

    it('must return invalid password error (one digit required)', async () => {
      const expectedErrorName = 'InvalidPassword';
      const newUser = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
        password: 'testtest',
      };

      const mutationResponse = await makeUserMutationRequest({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        birthDate: newUser.birthDate,
      });

      expect(mutationResponse.data.errors[0].name).to.be.equal(expectedErrorName);
      expect(mutationResponse.data.errors[0].additionalInfo).to.contain(rulesErrorMessage['contain_digit']);
    });

    interface UserMutationInput {
      name: string;
      birthDate: string;
      email: string;
      password: string;
    }

    function makeUserMutationRequest(user: UserMutationInput) {
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
      );
    }
  });
};
