import axios, { type AxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
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
