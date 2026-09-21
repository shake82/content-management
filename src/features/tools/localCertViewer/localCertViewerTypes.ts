import type { KeystoreKeyEntry } from '../../vault/detailTypes';

export type SecretSourceType = 'file' | 'text';

export interface ParseSecretRequest {
  content: string;
  sourceType: SecretSourceType;
  fileName?: string;
}

export interface ParsedSecretResponse {
  type: string;
  issueSeveritySummary: Record<string, Record<string, number>>;
  keyEntries: KeystoreKeyEntry[];
}
