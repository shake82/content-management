export interface KeystoreLocation {
  secretEngine: string;
  path: string;
  prop: string;
}

export function isCompleteKeystoreLocation(location: Partial<KeystoreLocation>): location is KeystoreLocation {
  return Boolean(location.secretEngine && location.path && location.prop);
}
