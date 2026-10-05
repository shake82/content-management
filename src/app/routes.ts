import type { KeystoreLocation } from '../features/vault/common/keystoreLocation';

export const routes = {
  vault: '/vault',
  vaultKeystore: '/vault/keystore',
  certificates: '/certificates',
  stagingCertificates: '/staging',
  stagingCertificateDetail: '/staging',
  toolsLocalCertViewer: '/tools/local-cert-viewer',
  toolsCertificateRequestGenerator: '/tools/certificate-request-generator',
} as const;

export function keystoreDetailsRoute({ engine, path, prop }: KeystoreLocation) {
  const query = new URLSearchParams({ engine, path, prop });
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

export function encodeStagingCertificatePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

export function decodeStagingCertificatePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent)
    .join('/');
}

export function stagingCertificateDetailRoute(key: string) {
  const encodedKey = encodeStagingCertificatePath(key);
  return encodedKey ? `${routes.stagingCertificateDetail}/${encodedKey}` : routes.stagingCertificates;
}
