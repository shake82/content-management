import { encodeStagingCertificatePath } from '../app/routes';
import type { GenerateCertificateRequestPayload } from '../features/tools/certificateRequestGenerator/certificateRequestTypes';
import type {
  CompleteCertificateRequestPayload,
  CreateStagingCertificateResponse,
  GenerateKeyStorePayload,
  StagingCertificateDetail,
  StagingCertificateStatus,
} from '../features/stagingCertificates/stagingCertificateTypes';
import { getJson, postJson } from './apiClient';

export const STAGING_CERTIFICATE_ENDPOINT = '/stagingCerts';
export const STAGING_CERTIFICATE_STATUS_CONCURRENCY = 3;

type PartialStatusResponse = Partial<StagingCertificateStatus> & { hasMissingKeystore?: boolean };

function normalizeStatus(status: PartialStatusResponse): StagingCertificateStatus {
  return {
    hasMissingKeyPair: status.hasMissingKeyPair ?? false,
    hasMissingKeyStore: status.hasMissingKeyStore ?? status.hasMissingKeystore ?? false,
    hasPendingCertRequest: status.hasPendingCertRequest ?? false,
    issues: status.issues ?? [],
  };
}

function stagingCertificateResource(path: string) {
  const encodedPath = encodeStagingCertificatePath(path);
  return encodedPath ? `${STAGING_CERTIFICATE_ENDPOINT}/${encodedPath}` : STAGING_CERTIFICATE_ENDPOINT;
}

export async function getStagingCertificateKeys() {
  const keys = await getJson<string[]>(STAGING_CERTIFICATE_ENDPOINT);
  return Array.isArray(keys) ? keys : [];
}

export async function getStagingCertificateStatus(key: string) {
  const status = await getJson<PartialStatusResponse>(
    `${stagingCertificateResource(key)}/getStatus`,
  );
  return normalizeStatus(status);
}

export function createStagingCertificate(payload: GenerateCertificateRequestPayload) {
  return postJson<CreateStagingCertificateResponse, GenerateCertificateRequestPayload>(
    STAGING_CERTIFICATE_ENDPOINT,
    payload,
  );
}

export function getStagingCertificateDetail(path: string) {
  return getJson<StagingCertificateDetail>(stagingCertificateResource(path));
}

export function completeCertificateRequest(
  path: string,
  payload: CompleteCertificateRequestPayload,
) {
  return postJson<StagingCertificateDetail, CompleteCertificateRequestPayload>(
    stagingCertificateResource(path),
    payload,
  );
}

export function generateKeyStore(
  path: string,
  payload: GenerateKeyStorePayload,
) {
  return postJson<StagingCertificateDetail, GenerateKeyStorePayload>(
    `${stagingCertificateResource(path)}/generateKeyStore`,
    payload,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
