import axios, { AxiosRequestHeaders } from 'axios';

export function makeGraphqlResquest(
  url: string,
  query: string,
  variables: object = undefined,
  jwtToken?: string,
  headers?: AxiosRequestHeaders,
) {
  variables = variables ?? {};
  const authorization = jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined;
  return axios.post(
    url,
    {
      query,
      variables,
    },
    {
      headers: {
        'content-type': 'application/json',
        ...authorization,
        ...headers,
      },
    },
  );
}
