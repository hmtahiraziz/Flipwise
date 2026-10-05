import {API_BASE_URL as ENV_API_BASE_URL} from '@env';

function normalizeBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() || 'http://localhost:3000';
  return trimmed.replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(ENV_API_BASE_URL);

export function isLocalApiUrl(url: string = API_BASE_URL): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '10.0.2.2' ||
      host.endsWith('.local')
    );
  } catch {
    return true;
  }
}

export function isHttpsApiUrl(url: string = API_BASE_URL): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
