import type { KeystoreCertificate, KeystoreIssue } from '../vault/detailTypes';

export interface CertificateVaultReference {
  catalogId: number;
  path: string;
  property: string;
  secretEngine: string;
  secretVersion: number;
  type: string;
}

export interface CertificateCatalogItem {
  id: number;
  shortName: string;
  entryType: string;
  expirationDate: string | null;
  certificates: KeystoreCertificate[];
  vaultReferences: CertificateVaultReference[];
  issues?: KeystoreIssue[];
}

export interface CertificateCatalogPage {
  content: CertificateCatalogItem[];
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CertificateCatalogRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
}
