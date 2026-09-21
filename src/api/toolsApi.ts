import type { KeystoreKeyEntry } from '../features/vault/detailTypes';
import type { ParseSecretRequest, ParsedSecretResponse } from '../features/tools/localCertViewer/localCertViewerTypes';
import { postJson } from './apiClient';

export const PARSE_SECRET_ENDPOINT = '/api/tools/parsesecret';

function normalizeEntries(entries: KeystoreKeyEntry[] | undefined): KeystoreKeyEntry[] {
  return (entries ?? []).map((entry) => ({
    ...entry,
    issues: entry.issues ?? [],
    certificates: entry.certificates ?? [],
  }));
}

export async function parseSecret(request: ParseSecretRequest): Promise<ParsedSecretResponse> {
  const response = await postJson<Partial<ParsedSecretResponse>, ParseSecretRequest>(PARSE_SECRET_ENDPOINT, request);

  return {
    type: response.type ?? 'Unknown',
    issueSeveritySummary: response.issueSeveritySummary ?? {},
    keyEntries: normalizeEntries(response.keyEntries),
  };
}
