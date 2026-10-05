export interface KeystoreLocation {
  engine: string;
  path: string;
  prop: string;
}

export function isCompleteKeystoreLocation(location: Partial<KeystoreLocation>): location is KeystoreLocation {
  return Boolean(location.engine && location.path && location.prop);
}
