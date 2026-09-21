import { getKeystoreDetails } from '../../api/vaultApi';
import { useApi } from '../../hooks/useApi';
import type { KeystoreDetails } from './detailTypes';

export function useKeystoreDetails(catalogId: number | undefined) {
  return useApi<KeystoreDetails>(() => getKeystoreDetails(catalogId));
}
