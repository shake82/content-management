import type { KeystoreKeyEntry } from '../../vault/detailTypes';

export type SecretSourceType = 'file' | 'text';

export type ParseSecretRequest =
  | { sourceType: 'file'; file: File }
  | { sourceType: 'text'; content: string; fileName?: string };

export interface ParsedSecretResponse {
  type: string;
  issueSeveritySummary: Record<string, Record<string, number>>;
  keyEntries: KeystoreKeyEntry[];
}
