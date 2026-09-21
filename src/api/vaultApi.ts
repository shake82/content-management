import type { VaultCatalogItem } from '../features/vault/catalogTypes';
import type { KeystoreComparison, KeystoreDetails } from '../features/vault/detailTypes';
import { getJson } from './apiClient';

export const VAULT_CATALOG_ENDPOINT = '/secret/vaultcatalog';
export const VAULT_DETAIL_ENDPOINT = '/secret/vaultcatalog';
export const VAULT_COMPARE_ENDPOINT = '/secret/vault-compare';

export function getVaultCatalog(): Promise<VaultCatalogItem[]> {
  return getJson<VaultCatalogItem[]>(`${VAULT_CATALOG_ENDPOINT}.json`);
}

export function getKeystoreComparison(
  catalogId: number | undefined,
  currentVersion: number,
  selectedVersion: number,
): Promise<KeystoreComparison> {
  if (catalogId === undefined || Number.isNaN(catalogId)) {
    return Promise.reject(new Error('A catalog ID is required.'));
  }

  return getJson<KeystoreComparison>(`${VAULT_COMPARE_ENDPOINT}.json`, {
    params: {
      catalogId,
      sourceVersion: currentVersion,
      targetVersion: selectedVersion,
    },
  });
}

export function getKeystoreDetails(catalogId: number | undefined): Promise<KeystoreDetails> {
  if (catalogId === undefined || Number.isNaN(catalogId)) {
    return Promise.reject(new Error('A catalog ID is required.'));
  }

  return getJson<KeystoreDetails>(`${VAULT_DETAIL_ENDPOINT}/${catalogId}.json`);
}
