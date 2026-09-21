import type {
  CertificateCatalogItem,
  CertificateCatalogPage,
  CertificateCatalogRequest,
} from '../features/certificates/certificateCatalogTypes';
import { getJson } from './apiClient';

export const CERTIFICATE_CATALOG_ENDPOINT = '/secret/certCatalog';
const CERTIFICATE_CATALOG_DATA_URL = `${CERTIFICATE_CATALOG_ENDPOINT}.json`;

function normalizeItem(item: CertificateCatalogItem): CertificateCatalogItem {
  return {
    ...item,
    certChainDetails: {
      ...item.certChainDetails,
      certificates: item.certChainDetails?.certificates ?? [],
      issues: item.certChainDetails?.issues ?? [],
    },
    vaultReferences: item.vaultReferences ?? [],
  };
}

export async function getCertificateCatalog({
  pageNumber,
  pageSize,
  search,
}: CertificateCatalogRequest): Promise<CertificateCatalogPage> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  const trimmedSearch = search?.trim();
  if (trimmedSearch) params.set('search', trimmedSearch);

  const page = await getJson<CertificateCatalogPage>(CERTIFICATE_CATALOG_DATA_URL, { params });

  return {
    ...page,
    content: (page.content ?? []).map(normalizeItem),
  };
}
