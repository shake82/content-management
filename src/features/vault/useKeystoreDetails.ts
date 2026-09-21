import { getKeystoreDetails } from '../../api/vaultApi';
import { useApi } from '../../hooks/useApi';
import type { KeystoreDetails } from './detailTypes';
import type { KeystoreLocation } from './keystoreLocation';

export function useKeystoreDetails(location: Partial<KeystoreLocation>) {
  return useApi<KeystoreDetails>(
    () => getKeystoreDetails(location),
    [location.secretEngine, location.path, location.prop],
  );
}
