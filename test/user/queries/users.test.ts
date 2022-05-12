import { expect } from 'chai';
import { BAD_REQUEST_ERROR_CODE, DEFAULT_USERS_QUERY_PAGE_SIZE, UNAUTHORIZED_ERROR_CODE } from '../../../src/consts';
import { dataSource, purgeDataSource } from '../../../src/data-source';
import { seedUsers } from '../../../src/seeds/users';
import { signJwt } from '../../../src/utils/auth';
import { makeGraphqlResquest } from '../../../src/utils/graphql';

export const usersTests = (testServerUrl: string) => {
  describe('Users query', () => {
    const tokenPayload = {
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      birthDate: '2000-01-01',
    };
    const token = signJwt(tokenPayload);

    beforeEach(async () => {
      await purgeDataSource(dataSource);
    });

    it('must return correctly paginated results', async () => {
      const pageSize = 4;
      const userCount = 10;
      const users = await seedOrderedUsers(userCount);

      // First page
      const firstPageResponse = await makeUsersQueryRequest({ pageSize }, token);
      const firstPageResponseData = firstPageResponse.data.data.users;

      const secondPageResponse = await makeUsersQueryRequest(
        { pageSize, pageFirstUserId: firstPageResponseData.nextPageFirstUserId },
        token,
      );
      const secondPageResponseData = secondPageResponse.data.data.users;

      const thirdPageResponse = await makeUsersQueryRequest(
        { pageSize, pageFirstUserId: secondPageResponseData.nextPageFirstUserId },
        token,
      );
      const thirdPageResponseData = thirdPageResponse.data.data.users;

      expect(firstPageResponseData).to.be.deep.equal({
        users: users.slice(0, 4),
        userCount,
        nextPageFirstUserId: users[4].id,
        hasPreviousPage: false,
      });

      expect(secondPageResponseData).to.be.deep.equal({
        users: users.slice(4, 8),
        userCount,
        nextPageFirstUserId: users[8].id,
        hasPreviousPage: true,
      });

      expect(thirdPageResponseData).to.be.deep.equal({
        users: users.slice(8, 10),
        userCount,
        nextPageFirstUserId: null,
        hasPreviousPage: true,
      });
    });

    it('must return default page size users', async () => {
      const users = await seedOrderedUsers(DEFAULT_USERS_QUERY_PAGE_SIZE);

      const queryResponse = await makeUsersQueryRequest({}, token);
      const responseData = queryResponse.data.data.users;

      expect(responseData).to.be.deep.equal({
        users,
        userCount: DEFAULT_USERS_QUERY_PAGE_SIZE,
        nextPageFirstUserId: null,
        hasPreviousPage: false,
      });
    });

    it('must return defined page size users', async () => {
      const pageSize = 5;
      const users = await seedOrderedUsers(pageSize);

      const queryResponse = await makeUsersQueryRequest({ pageSize }, token);
      const responseData = queryResponse.data.data.users;

      expect(responseData).to.be.deep.equal({
        users,
        userCount: pageSize,
        nextPageFirstUserId: null,
        hasPreviousPage: false,
      });
    });

    it('must return correct nextPageFirstUserId', async () => {
      const pageSize = 4;
      const userCount = pageSize + 1;
      const users = await seedOrderedUsers(userCount);
      const lastUser = users.slice(-1)[0];

      const queryResponse = await makeUsersQueryRequest({ pageSize }, token);
      const responseData = queryResponse.data.data.users;

      expect(responseData).to.be.deep.equal({
        users: users.slice(0, pageSize),
        userCount,
        nextPageFirstUserId: lastUser.id,
        hasPreviousPage: false,
      });
    });

    it('must not return a full page when end is reached', async () => {
      const pageSize = 10;
      const userCount = 5;
      const users = await seedOrderedUsers(userCount);

      const queryResponse = await makeUsersQueryRequest({ pageSize }, token);
      const responseData = queryResponse.data.data.users;

      expect(responseData).to.be.deep.equal({
        users,
        userCount,
        nextPageFirstUserId: null,
        hasPreviousPage: false,
      });
    });

    it('must return no users', async () => {
      const queryResponse = await makeUsersQueryRequest({}, token);
      const responseData = queryResponse.data.data.users;

      expect(responseData).to.be.deep.equal({
        users: [],
        userCount: 0,
        nextPageFirstUserId: null,
        hasPreviousPage: false,
      });
    });

    it('must return authorization error', async () => {
      const queryResponse = await makeUsersQueryRequest({});

      expect(queryResponse.data.errors).to.be.deep.equal([
        {
          code: UNAUTHORIZED_ERROR_CODE,
          message: 'You must be logged in',
          additionalInfo: 'No jwt token was provided in the Authorization header',
          name: 'NoJwtToken',
        },
      ]);
    });

    it('must return invalid page size error (pageSize = 0)', async () => {
      const options: QueryOptions = { pageSize: 0 };

      const queryResponse = await makeUsersQueryRequest(options, token);

      expect(queryResponse.data.errors).to.be.deep.equal([
        {
          code: BAD_REQUEST_ERROR_CODE,
          name: 'InvalidPageSize',
          message: 'Invalid page size',
          additionalInfo: 'Page size must be greater than 0',
        },
      ]);
    });

    it('must return invalid page size error (pageSize = -1)', async () => {
      const options: QueryOptions = { pageSize: -1 };

      const queryResponse = await makeUsersQueryRequest(options, token);

      expect(queryResponse.data.errors).to.be.deep.equal([
        {
          code: BAD_REQUEST_ERROR_CODE,
          name: 'InvalidPageSize',
          message: 'Invalid page size',
          additionalInfo: 'Page size must be greater than 0',
        },
      ]);
    });

    interface QueryOptions {
      pageSize?: number;
      skip?: number;
      pageFirstUserId?: number;
    }

    function makeUsersQueryRequest(options: QueryOptions, token?: string) {
      return makeGraphqlResquest(
        testServerUrl,
        `query Users($options: UsersQueryOptions) {
            users(options: $options) {
                users {
                id
                name
                email
                birthDate
                }
                userCount
                nextPageFirstUserId
                hasPreviousPage
            }
        }`,
        { options },
        token,
      );
    }

    async function seedOrderedUsers(userCount: number) {
      const seededUsers = await seedUsers(userCount, dataSource);

      return seededUsers
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }))
        .sort((userA, userB) => {
          if (userA.name === userB.name) {
            return userA.id - userB.id;
          }
          return userA.name.localeCompare(userB.name);
        });
    }
  });
};
