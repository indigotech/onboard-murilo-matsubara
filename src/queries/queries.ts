import { readFileSync } from 'fs';

export const Queries = {
  paginatedUsers: readFileSync(__dirname + '/paginated-users.sql').toString(),
  paginatedUsersFilterId: readFileSync(__dirname + '/paginated-users-filter-id.sql').toString(),
};
