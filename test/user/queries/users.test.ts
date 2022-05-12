import { dataSource } from '../../../src/data-source';
import { User } from '../../../src/entities/user.entity';
import { makeGraphqlResquest } from '../../../src/utils/graphql';

export const userTests = (testServerUrl: string) => {
  describe('User query', () => {
    let onlyUser: User;
    let token: string;
    let onlyUserPayload: { id: number; name: string; email: string; birthDate: string };

    beforeEach(async () => {
      await purgeDateSource(dataSource);
    });

    interface QueryOptions {
        pageSize?: number;
        skip?: number;
        pageFirstUserId?: number;
    }

    function makeUsersQueryRequest(options: , token?: string) {
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
