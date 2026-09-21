import type { CurrentUser } from '../features/user/userTypes';
import { getJson } from './apiClient';

export const CURRENT_USER_ENDPOINT = '/user/current';
const CURRENT_USER_DATA_URL = `${CURRENT_USER_ENDPOINT}.json`;

export function getCurrentUser(): Promise<CurrentUser> {
  return getJson<CurrentUser>(CURRENT_USER_DATA_URL);
}
