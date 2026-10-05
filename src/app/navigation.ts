import type { CurrentUser } from '../features/user/userTypes';
import { routes } from './routes';

export const permissions = {
  manageStagingCertificates: 'MANAGE_STAGING_CERTS',
} as const;

export interface NavigationItem {
  label: string;
  to: string;
  permission?: string;
}

export const directNavigationItems: NavigationItem[] = [
  { label: 'Vault View', to: routes.vault },
  { label: 'Certificate View', to: routes.certificates },
  { label: 'Staging Certificates', to: routes.stagingCertificates, permission: permissions.manageStagingCertificates },
];

export const toolNavigationItems: NavigationItem[] = [
  { label: 'Local Cert Viewer', to: routes.toolsLocalCertViewer },
  { label: 'Certificate Request Generator', to: routes.toolsCertificateRequestGenerator },
];

const navigationItems = [...directNavigationItems, ...toolNavigationItems];

export function canAccess(user: CurrentUser, permission?: string) {
  return permission === undefined || user.permissions[permission] === true;
}

export function firstAccessibleRoute(user: CurrentUser) {
  return navigationItems.find((item) => canAccess(user, item.permission))?.to ?? routes.toolsLocalCertViewer;
}
