import type { KeystoreLocation } from '../features/vault/keystoreLocation';

export const routes = {
  vault: '/vault',
  vaultKeystore: '/vault/keystore',
  certificates: '/certificates',
  reports: '/reports',
  toolsImport: '/tools/import',
  toolsAudit: '/tools/audit',
  toolsLocalCertViewer: '/tools/local-cert-viewer',
  settings: '/settings',
} as const;

export function keystoreDetailsRoute({ secretEngine, path, prop }: KeystoreLocation) {
  const query = new URLSearchParams({ secretEngine, path, prop });
  return `${routes.vaultKeystore}?${query}`;
}

export function vaultPathRoute(path: string) {
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return encodedPath ? `${routes.vault}/${encodedPath}` : routes.vault;
}
