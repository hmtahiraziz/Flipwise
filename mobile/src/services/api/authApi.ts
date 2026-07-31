import {apiClient} from './client';
import type {MeResponse, User} from '../../types/api';

export async function meRequest(): Promise<User> {
  const {data} = await apiClient.get<MeResponse>('/api/auth/me');
  return data.user;
}
