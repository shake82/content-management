import { beforeEach, expect, it, vi } from 'vitest';
import { getJson, postJson } from './apiClient';
import {
  createStagingCertificate,
  getStagingCertificateKeys,
  getStagingCertificateStatus,
  STAGING_CERTIFICATE_ENDPOINT,
} from './stagingCertificateApi';

vi.mock('./apiClient', () => ({ getJson: vi.fn(), postJson: vi.fn() }));

beforeEach(() => {
  vi.mocked(getJson).mockReset();
  vi.mocked(postJson).mockReset();
});

it('loads keys, encoded status, and creates staging certificates through the expected endpoints', async () => {
  vi.mocked(getJson).mockResolvedValueOnce(['apps/prod/payments']);
  vi.mocked(getJson).mockResolvedValueOnce({
    hasMissingKeystore: true,
    issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }],
  });
  vi.mocked(postJson).mockResolvedValue({ path: 'apps/prod/payments', version: 3 });

  const keys = await getStagingCertificateKeys();
  const status = await getStagingCertificateStatus('apps/prod/payments');
  const response = await createStagingCertificate({ subject: 'CN=payments', alternateSubjects: [] });

  expect(keys).toEqual(['apps/prod/payments']);
  expect(getJson).toHaveBeenNthCalledWith(1, STAGING_CERTIFICATE_ENDPOINT);
  expect(getJson).toHaveBeenNthCalledWith(2, `${STAGING_CERTIFICATE_ENDPOINT}/apps%2Fprod%2Fpayments/getStatus`);
  expect(status).toEqual({
    hasMissingKeyPair: false,
    hasMissingKeystore: true,
    hasPendingCertRequest: false,
    issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }],
  });
  expect(postJson).toHaveBeenCalledWith(
    STAGING_CERTIFICATE_ENDPOINT,
    { subject: 'CN=payments', alternateSubjects: [] },
  );
  expect(response).toEqual({ path: 'apps/prod/payments', version: 3 });
});
