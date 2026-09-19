import { getCurrentUser } from '../../api/userApi';
import { useApi } from '../../hooks/useApi';

export function useCurrentUser() {
  return useApi(getCurrentUser);
}
