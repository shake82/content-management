import { beforeEach, expect, it, vi } from 'vitest';
import { getJson, postJson } from './apiClient';
import {
  completeCertificateRequest,
  createStagingCertificate,
  getStagingCertificateDetail,
  getStagingCertificateKeys,
  getStagingCertificateStatus,
  STAGING_CERTIFICATE_ENDPOINT,
} from './stagingCertificateApi';

vi.mock('./apiClient', () => ({ getJson: vi.fn(), postJson: vi.fn() }));

beforeEach(() => {
  vi.mocked(getJson).mockReset();
  vi.mocked(postJson).mockReset();
});

it('loads keys, encoded status, detail data, create requests, and completion uploads through expected endpoints', async () => {
  vi.mocked(getJson).mockResolvedValueOnce(['apps/prod/payments']);
  vi.mocked(getJson).mockResolvedValueOnce({
    hasMissingKeystore: true,
    issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }],
  });
  vi.mocked(getJson).mockResolvedValueOnce({ hasMissingKeystore: true, certificateRequestInfo: null });
  vi.mocked(postJson).mockResolvedValueOnce({ path: 'apps/prod/payments', version: 3 });
  vi.mocked(postJson).mockResolvedValueOnce({ hasMissingKeystore: false, certificateRequestInfo: null });

  const keys = await getStagingCertificateKeys();
  const status = await getStagingCertificateStatus('apps/prod/payments');
  const detail = await getStagingCertificateDetail('apps/prod/payments');
  const response = await createStagingCertificate({ subject: 'CN=payments', alternateSubjects: [] });
  const completed = await completeCertificateRequest('apps/prod/payments', {
    cert: '-----BEGIN CERTIFICATE-----',
    parentChain: '',
  });

  expect(keys).toEqual(['apps/prod/payments']);
  expect(getJson).toHaveBeenNthCalledWith(1, STAGING_CERTIFICATE_ENDPOINT);
  expect(getJson).toHaveBeenNthCalledWith(2, `${STAGING_CERTIFICATE_ENDPOINT}/apps/prod/payments/getStatus`);
  expect(getJson).toHaveBeenNthCalledWith(3, `${STAGING_CERTIFICATE_ENDPOINT}/apps/prod/payments`);
  expect(status).toEqual({
    hasMissingKeyPair: false,
    hasMissingKeyStore: true,
    hasPendingCertRequest: false,
    issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }],
  });
  expect(detail).toEqual({ hasMissingKeystore: true, certificateRequestInfo: null });
  expect(postJson).toHaveBeenNthCalledWith(
    1,
    STAGING_CERTIFICATE_ENDPOINT,
    { subject: 'CN=payments', alternateSubjects: [] },
  );
  expect(postJson).toHaveBeenNthCalledWith(
    2,
    `${STAGING_CERTIFICATE_ENDPOINT}/apps/prod/payments`,
    { cert: '-----BEGIN CERTIFICATE-----', parentChain: '' },
  );
  expect(response).toEqual({ path: 'apps/prod/payments', version: 3 });
  expect(completed).toEqual({ hasMissingKeystore: false, certificateRequestInfo: null });
});
