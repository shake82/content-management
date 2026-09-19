import currentUser from '../mocks/currentUser.json';
import type { CurrentUser } from '../features/user/userTypes';
import { mockGet } from './apiClient';

export const CURRENT_USER_ENDPOINT = '/api/user/current';

export function getCurrentUser(): Promise<CurrentUser> {
  return mockGet(CURRENT_USER_ENDPOINT, currentUser as CurrentUser);
}
