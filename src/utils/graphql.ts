import axios from 'axios';

export function makeGraphqlResquest(url: string, query: string, variables: unknown = undefined) {
  variables = variables ?? {};
  return axios.post(
    url,
    {
      query,
      variables,
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}
