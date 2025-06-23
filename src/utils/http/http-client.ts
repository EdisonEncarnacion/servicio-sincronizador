import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../../config/env';
const http: AxiosInstance = axios.create({
  baseURL: config.EXTERNAL_API_URL, 
  timeout: 10_000,
});
http.interceptors.request.use((cfg) => {
  if (!cfg.headers || !(cfg.headers instanceof AxiosHeaders)) {
    cfg.headers = new AxiosHeaders(cfg.headers || {});
  }
  (cfg.headers as AxiosHeaders).set(
    'api-key-sincronizador',
    config.SYNC_API_KEY ?? '',
  );
  return cfg;
});
export async function request<T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.request<T>(config);
  return data;
}
export { http }; 
