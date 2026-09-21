import certificateCatalog from '../../sample.json';
import type {
  CertificateCatalogItem,
  CertificateCatalogPage,
  CertificateCatalogRequest,
} from '../features/certificates/certificateCatalogTypes';
import { mockGet } from './apiClient';

export const CERTIFICATE_CATALOG_ENDPOINT = '/api/secret/certCatalog';

function normalizeItem(item: CertificateCatalogItem): CertificateCatalogItem {
  return {
    ...item,
    certificates: item.certificates ?? [],
    vaultReferences: item.vaultReferences ?? [],
    issues: item.issues ?? [],
  };
}

export async function getCertificateCatalog({
  pageNumber,
  pageSize,
  search,
}: CertificateCatalogRequest): Promise<CertificateCatalogPage> {
  const query = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  const trimmedSearch = search?.trim();
  if (trimmedSearch) query.set('search', trimmedSearch);

  const page = await mockGet(
    `${CERTIFICATE_CATALOG_ENDPOINT}?${query}`,
    certificateCatalog as unknown as CertificateCatalogPage,
  );

  return {
    ...page,
    content: (page.content ?? []).map(normalizeItem),
  };
}
