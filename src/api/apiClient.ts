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
