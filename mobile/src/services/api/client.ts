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

  // React Native Android rejects FormData when Content-Type is forced to
  // application/json or bare multipart/form-data (missing boundary).
  // Leave Content-Type unset so the native stack can set the boundary.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = config.headers;
    if (headers && typeof headers.set === 'function') {
      headers.set('Content-Type', null);
    } else if (headers) {
      delete (headers as Record<string, unknown>)['Content-Type'];
      delete (headers as Record<string, unknown>)['content-type'];
    }
  }

  return config;
});

export async function checkHealth(): Promise<{ok: boolean}> {
  const {data} = await apiClient.get<{ok: boolean}>('/health');
  return data;
}
