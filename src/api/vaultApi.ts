import vaultCatalog from '../mocks/vaultCatalog.json';
import type { VaultCatalogItem } from '../features/vault/catalogTypes';
import { mockGet } from './apiClient';

export const VAULT_CATALOG_ENDPOINT = '/api/secret/vaultcatalog';

export function getVaultCatalog(): Promise<VaultCatalogItem[]> {
  return mockGet(VAULT_CATALOG_ENDPOINT, vaultCatalog as unknown as VaultCatalogItem[]);
}
