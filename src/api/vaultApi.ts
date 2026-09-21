import type { VaultCatalogItem } from '../features/vault/catalogTypes';
import type { KeystoreComparison, KeystoreDetails } from '../features/vault/detailTypes';
import { isCompleteKeystoreLocation, type KeystoreLocation } from '../features/vault/keystoreLocation';
import { getJson } from './apiClient';

export const VAULT_CATALOG_ENDPOINT = '/secret/vaultcatalog';
export const VAULT_DETAIL_ENDPOINT = '/secret/vault';
export const VAULT_COMPARE_ENDPOINT = '/secret/vault-compare';

export function getVaultCatalog(): Promise<VaultCatalogItem[]> {
  return getJson<VaultCatalogItem[]>(`${VAULT_CATALOG_ENDPOINT}.json`);
}

export function getKeystoreComparison(
  location: Partial<KeystoreLocation>,
  version: number,
): Promise<KeystoreComparison> {
  if (!isCompleteKeystoreLocation(location)) {
    return Promise.reject(new Error('A secret engine, path, and property are required.'));
  }

  return getJson<KeystoreComparison>(`${VAULT_COMPARE_ENDPOINT}.json`, {
    params: {
      engine: location.engine,
      path: location.path,
      prop: location.prop,
      version,
    },
  });
}

export function getKeystoreDetails(location: Partial<KeystoreLocation>): Promise<KeystoreDetails> {
  if (!isCompleteKeystoreLocation(location)) {
    return Promise.reject(new Error('A secret engine, path, and property are required.'));
  }

  return getJson<KeystoreDetails>(`${VAULT_DETAIL_ENDPOINT}.json`, {
    params: location,
  });
}
