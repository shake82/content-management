import { getKeystoreComparison } from '../../api/vaultApi';
import { useApi } from '../../hooks/useApi';
import type { KeystoreComparison } from './detailTypes';
import type { KeystoreLocation } from './keystoreLocation';

export function useKeystoreComparison(
  location: Partial<KeystoreLocation>,
  currentVersion: number,
  selectedVersion: number,
) {
  return useApi<KeystoreComparison>(
    () => getKeystoreComparison(location, currentVersion, selectedVersion),
    [location.engine, location.path, location.prop, currentVersion, selectedVersion],
  );
}
