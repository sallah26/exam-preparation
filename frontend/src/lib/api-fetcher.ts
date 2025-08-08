import { server_host } from '@/config/host.config';
import axios from 'axios';
import { getAuthJwt, removeAuth } from './auth-token';

const fetcherNoAuth = axios.create({
  baseURL: server_host,
});

fetcherNoAuth.interceptors.response.use(
  (response) => response,
  async (error) => Promise.resolve(error?.response),
);

const fetcher = axios.create({
  baseURL: server_host,
});

fetcher.interceptors.request.use(
  async (config) => {
    const jwt = await getAuthJwt();
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${jwt?.token ?? ''}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

fetcher.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeAuth();
    }
    return Promise.resolve(error?.response ?? {
      error: true,
      message: 'Unknown Error',
    });
  },
);

export { fetcher, fetcherNoAuth };