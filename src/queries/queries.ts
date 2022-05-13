import { readFileSync } from 'fs';

const basePath = process.cwd() + '/src/queries';

export const Queries = {
  paginatedUsers: readFileSync(basePath + '/paginated-users.sql').toString(),
  paginatedUsersFilterId: readFileSync(basePath + '/paginated-users-filter-id.sql').toString(),
};
