import type { CurrentUser } from '../features/user/userTypes';
import { routes } from './routes';

export const permissions = {
  viewReports: 'reports.view',
} as const;

export interface NavigationItem {
  label: string;
  to: string;
  permission?: string;
}

export const directNavigationItems: NavigationItem[] = [
  { label: 'Vault View', to: routes.vault },
  { label: 'Certificate View', to: routes.certificates },
  { label: 'Reports', to: routes.reports, permission: permissions.viewReports },
];

export const toolNavigationItems: NavigationItem[] = [
  { label: 'Local Cert Viewer', to: routes.toolsLocalCertViewer },
  { label: 'Import certificates', to: routes.toolsImport },
  { label: 'Audit history', to: routes.toolsAudit },
];

export const settingsNavigationItem: NavigationItem = { label: 'Settings', to: routes.settings };

const navigationItems = [...directNavigationItems, ...toolNavigationItems, settingsNavigationItem];

export function canAccess(user: CurrentUser, permission?: string) {
  return permission === undefined || user.permissions[permission] === true;
}

export function firstAccessibleRoute(user: CurrentUser) {
  return navigationItems.find((item) => canAccess(user, item.permission))?.to ?? routes.toolsLocalCertViewer;
}
