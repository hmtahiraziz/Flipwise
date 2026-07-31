import axios from 'axios';
import {API_BASE_URL} from '../../config/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
});

let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(
  getter: (() => Promise<string | null>) | null,
): void {
  authTokenGetter = getter;
}

apiClient.interceptors.request.use(async config => {
  if (authTokenGetter) {
    const token = await authTokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function checkHealth(): Promise<{ok: boolean}> {
  const {data} = await apiClient.get<{ok: boolean}>('/health');
  return data;
}
