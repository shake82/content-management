import vaultCatalog from '../mocks/vaultCatalog.json';
import type { VaultCatalogItem } from '../features/vault/catalogTypes';
import type { KeystoreComparison, KeystoreDetails } from '../features/vault/detailTypes';
import vaultDetail from '../../vault-detail-sample.json';
import vaultComparison from '../../vault-compare-sample.json';
import { mockGet } from './apiClient';

export const VAULT_CATALOG_ENDPOINT = '/api/secret/vaultcatalog';
export const VAULT_DETAIL_ENDPOINT = '/api/secret/vaultcatalog';
export const VAULT_COMPARE_ENDPOINT = '/api/secret/vault-compare';

export function getVaultCatalog(): Promise<VaultCatalogItem[]> {
  return mockGet(VAULT_CATALOG_ENDPOINT, vaultCatalog as unknown as VaultCatalogItem[]);
}

export function getKeystoreComparison(
  catalogId: number | undefined,
  currentVersion: number,
  selectedVersion: number,
): Promise<KeystoreComparison> {
  if (catalogId === undefined || Number.isNaN(catalogId)) {
    return Promise.reject(new Error('A catalog ID is required.'));
  }

  const query = new URLSearchParams({
    catalogId: String(catalogId),
    sourceVersion: String(currentVersion),
    targetVersion: String(selectedVersion),
  });

  return mockGet(`${VAULT_COMPARE_ENDPOINT}?${query}`, vaultComparison as unknown as KeystoreComparison);
}

export function getKeystoreDetails(catalogId: number | undefined): Promise<KeystoreDetails> {
  if (catalogId === undefined || Number.isNaN(catalogId)) {
    return Promise.reject(new Error('A catalog ID is required.'));
  }

  return mockGet(`${VAULT_DETAIL_ENDPOINT}/${catalogId}`, vaultDetail as unknown as KeystoreDetails);
}
