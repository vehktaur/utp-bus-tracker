import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { mockAdapter } from './mock/adapter';
import { AppContentType, HttpMethodType } from './enums';
import type { HttpMethod } from './enums';

const _baseURL = import.meta.env.VITE_BASE_ENDPOINT as string | undefined;
export const _baseTimeOut = import.meta.env.VITE_API_TIMEOUT || 50_000;

export const isMockApi = !_baseURL;

const httpClient = axios.create({
  baseURL: _baseURL || '/',
  headers: {
    Accept: AppContentType.JSON,
    'Content-Type': AppContentType.JSON,
  },
  timeout: Number(_baseTimeOut),
  ...(isMockApi && { adapter: mockAdapter }),
});

export interface IAppRequest extends Omit<AxiosRequestConfig, 'method'> {
  url: string;
  method?: HttpMethod;
}

export const appRequest = <T = unknown>({
  method = HttpMethodType.GET,
  ...config
}: IAppRequest): Promise<AxiosResponse<T>> =>
  httpClient.request<T>({ ...config, method });
