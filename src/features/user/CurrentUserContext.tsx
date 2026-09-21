import { createContext, useContext, type ReactNode } from 'react';
import type { ApiState } from '../../api/apiState';
import { getCurrentUser } from '../../api/userApi';
import { useApi } from '../../hooks/useApi';
import type { CurrentUser } from './userTypes';

const CurrentUserContext = createContext<ApiState<CurrentUser> | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const currentUser = useApi(getCurrentUser);
  return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>;
}

export function CurrentUserStateProvider({
  children,
  state,
}: {
  children: ReactNode;
  state: ApiState<CurrentUser>;
}) {
  return <CurrentUserContext.Provider value={state}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUserContext() {
  const currentUser = useContext(CurrentUserContext);
  if (!currentUser) throw new Error('Current user components must be rendered inside CurrentUserProvider.');
  return currentUser;
}
