import { getVaultCatalog } from '../../api/vaultApi';
import { useApi } from '../../hooks/useApi';

export function useVaultCatalog() {
  return useApi(getVaultCatalog);
}
