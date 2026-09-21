import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { firstAccessibleRoute } from '../../app/navigation';
import { StatusView } from '../../components/StatusView';
import { useCurrentUser } from './useCurrentUser';

interface RequirePermissionProps {
  children: ReactNode;
  permission: string;
}

export function RequirePermission({ children, permission }: RequirePermissionProps) {
  const { status, data, error, refetch } = useCurrentUser();

  if (status === 'idle' || status === 'loading') {
    return <StatusView kind="loading" message="Loading user permissions..." />;
  }

  if (status === 'error' || !data) {
    return <StatusView kind="error" message={error?.message ?? 'User permissions are unavailable.'} onRetry={refetch} />;
  }

  if (data.permissions[permission] !== true) {
    return <Navigate to={firstAccessibleRoute(data)} replace />;
  }

  return children;
}
