export interface KeystoreIssue {
  type: string;
  severity: string;
}

export interface KeystoreCertificate {
  shortName?: string;
  shortname?: string;
  startDate: string | null;
  endDate: string | null;
  revocationDate: string | null;
  version: number;
  subject: string;
  issuer: string;
  hexSerialNumber: string;
  fingerpring?: string;
  fingerprint?: string;
}

export interface KeystoreKeyEntry {
  alias: string;
  entryType: string;
  certificates: KeystoreCertificate[];
  expirationDate: string | null;
  issues: KeystoreIssue[];
  lastModifiedDate: string | null;
}

export interface KeystoreDetails {
  version: number;
  secretMetadata: SecretMetadata;
  versions: KeystoreVersion[];
}

export interface SecretMetadata {
  type: string;
  keyEntries: KeystoreKeyEntry[];
}

export interface KeystoreVersion {
  createdDate: string;
  version: number;
}

export interface KeystoreComparisonEntry {
  alias: string;
  comparisonResult: string;
  sourceKeyEntry: KeystoreKeyEntry | null;
  targetKeyEntry: KeystoreKeyEntry | null;
}

export interface KeystoreComparison {
  keyEntries: KeystoreComparisonEntry[];
}
