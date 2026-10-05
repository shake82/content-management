import { getKeystoreDetails } from '../../../api/vaultApi';
import { useApi } from '../../../hooks/useApi';
import type { KeystoreDetails } from '../common/detailTypes';
import type { KeystoreLocation } from '../common/keystoreLocation';

export function useKeystoreDetails(location: Partial<KeystoreLocation>) {
  return useApi<KeystoreDetails>(
    () => getKeystoreDetails(location),
    [location.engine, location.path, location.prop],
  );
}
