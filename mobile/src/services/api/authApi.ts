import {apiClient} from './client';
import type {MeResponse, User} from '../../types/api';

export async function meRequest(): Promise<User> {
  const {data} = await apiClient.get<MeResponse>('/api/auth/me');
  return data.user;
}

/** Permanently deletes Neon study data + Clerk user for the signed-in account. */
export async function deleteAccountRequest(): Promise<void> {
  await apiClient.delete<{ok: boolean}>('/api/auth/account');
}
