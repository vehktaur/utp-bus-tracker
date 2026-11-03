export const HttpMethodType = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = (typeof HttpMethodType)[keyof typeof HttpMethodType];

export const AppContentType = {
  JSON: 'application/json',
} as const;
