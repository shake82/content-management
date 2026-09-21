import { useCurrentUserContext } from './CurrentUserContext';

export function useCurrentUser() {
  return useCurrentUserContext();
}
