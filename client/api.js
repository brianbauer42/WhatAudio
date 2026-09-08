import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

/** Pulls the server's `{ message }` out of a failed request. */
export function errorMessage(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.message || error?.message || fallback;
}
