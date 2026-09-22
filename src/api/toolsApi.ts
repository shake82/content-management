import type { KeystoreKeyEntry } from '../features/vault/detailTypes';
import type { ParseSecretRequest, ParsedSecretResponse } from '../features/tools/localCertViewer/localCertViewerTypes';
import { postFormData } from './apiClient';

export const PARSE_SECRET_ENDPOINT = '/tools/parsesecret';

function normalizeEntries(entries: KeystoreKeyEntry[] | undefined): KeystoreKeyEntry[] {
  return (entries ?? []).map((entry) => ({
    ...entry,
    issues: entry.issues ?? [],
    certificates: entry.certificates ?? [],
  }));
}

export async function parseSecret(request: ParseSecretRequest): Promise<ParsedSecretResponse> {
  const formData = new FormData();
  const file = request.sourceType === 'file'
    ? request.file
    : new File([request.content], request.fileName ?? 'secret.txt', { type: 'text/plain' });

  formData.append('file', file);
  const response = await postFormData<Partial<ParsedSecretResponse>>(PARSE_SECRET_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    type: response.type ?? 'Unknown',
    issueSeveritySummary: response.issueSeveritySummary ?? {},
    keyEntries: normalizeEntries(response.keyEntries),
  };
}
