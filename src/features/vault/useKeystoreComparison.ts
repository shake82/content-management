import { getKeystoreComparison } from '../../api/vaultApi';
import { useApi } from '../../hooks/useApi';
import type { KeystoreComparison } from './detailTypes';
import type { KeystoreLocation } from './keystoreLocation';

export function useKeystoreComparison(
  location: Partial<KeystoreLocation>,
  version: number,
) {
  return useApi<KeystoreComparison>(
    () => getKeystoreComparison(location, version),
    [location.engine, location.path, location.prop, version],
  );
}
