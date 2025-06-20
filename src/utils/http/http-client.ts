import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../../config/env';

const http: AxiosInstance = axios.create({
  baseURL: config.EXTERNAL_API_URL, 
  timeout: 10_000,
});
/* http.interceptors.request.use((config) => {
  // Ejemplo: inyectar JWT si existe
  if (env.RESERVATION_JWT) {
    config.headers.Authorization = `Bearer ${env.RESERVATION_JWT}`;
  }
  return config;
});
 */
http.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err) => {
    console.log(err.response?.data);
    return Promise.reject(err);
  },
);
export async function request<T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.request<T>(config);
  return data;
}
export { http }; 
