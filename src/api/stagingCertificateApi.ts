import type { GenerateCertificateRequestPayload } from '../features/tools/certificateRequestGenerator/certificateRequestTypes';
import type {
  CreateStagingCertificateResponse,
  StagingCertificateStatus,
} from '../features/stagingCertificates/stagingCertificateTypes';
import { getJson, postJson } from './apiClient';

export const STAGING_CERTIFICATE_ENDPOINT = '/stagingCert';
export const STAGING_CERTIFICATE_STATUS_CONCURRENCY = 3;

function normalizeStatus(status: Partial<StagingCertificateStatus>): StagingCertificateStatus {
  return {
    hasMissingKeyPair: status.hasMissingKeyPair ?? false,
    hasMissingKeystore: status.hasMissingKeystore ?? false,
    hasPendingCertRequest: status.hasPendingCertRequest ?? false,
    issues: status.issues ?? [],
  };
}

export async function getStagingCertificateKeys() {
  const keys = await getJson<string[]>(STAGING_CERTIFICATE_ENDPOINT);
  return Array.isArray(keys) ? keys : [];
}

export async function getStagingCertificateStatus(key: string) {
  const status = await getJson<Partial<StagingCertificateStatus>>(
    `${STAGING_CERTIFICATE_ENDPOINT}/${encodeURIComponent(key)}/getStatus`,
  );
  return normalizeStatus(status);
}

export function createStagingCertificate(payload: GenerateCertificateRequestPayload) {
  return postJson<CreateStagingCertificateResponse, GenerateCertificateRequestPayload>(
    STAGING_CERTIFICATE_ENDPOINT,
    payload,
  );
}
