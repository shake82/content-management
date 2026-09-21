import { getKeystoreComparison } from '../../api/vaultApi';
import { useApi } from '../../hooks/useApi';
import type { KeystoreComparison } from './detailTypes';

export function useKeystoreComparison(
  catalogId: number | undefined,
  currentVersion: number,
  selectedVersion: number,
) {
  return useApi<KeystoreComparison>(
    () => getKeystoreComparison(catalogId, currentVersion, selectedVersion),
    [catalogId, currentVersion, selectedVersion],
  );
}
