import axios, { type AxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8050/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

export async function getJson<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function postJson<TResponse, TRequest>(
  url: string,
  data: TRequest,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const response = await apiClient.post<TResponse>(url, data, config);
  return response.data;
}
