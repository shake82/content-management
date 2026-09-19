export const routes = {
  vault: '/vault',
  vaultKeystorePattern: '/vault/keystore/:catalogId',
  reports: '/reports',
  toolsImport: '/tools/import',
  toolsAudit: '/tools/audit',
  settings: '/settings',
} as const;

export function keystoreDetailsRoute(catalogId: number) {
  return `/vault/keystore/${catalogId}`;
}

export function vaultPathRoute(path: string) {
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return encodedPath ? `${routes.vault}/${encodedPath}` : routes.vault;
}
