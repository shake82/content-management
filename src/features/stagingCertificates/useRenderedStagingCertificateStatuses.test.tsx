import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getStagingCertificateStatus } from '../../api/stagingCertificateApi';
import { useRenderedStagingCertificateStatuses } from './useRenderedStagingCertificateStatuses';
import type { StagingCertificateStatus } from './stagingCertificateTypes';

vi.mock('../../api/stagingCertificateApi', () => ({
  getStagingCertificateStatus: vi.fn(),
  STAGING_CERTIFICATE_STATUS_CONCURRENCY: 3,
}));

function deferredStatus() {
  let resolve!: (status: StagingCertificateStatus) => void;
  const promise = new Promise<StagingCertificateStatus>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

const validStatus: StagingCertificateStatus = {
  hasMissingKeyPair: false,
  hasMissingKeystore: false,
  hasPendingCertRequest: false,
  issues: [],
};

beforeEach(() => {
  vi.mocked(getStagingCertificateStatus).mockReset();
});

it('streams visible row statuses as each request resolves and retries idle rows', async () => {
  const first = deferredStatus();
  const second = deferredStatus();
  vi.mocked(getStagingCertificateStatus)
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)
    .mockResolvedValueOnce({ ...validStatus, hasPendingCertRequest: true });

  const { result } = renderHook(() => useRenderedStagingCertificateStatuses(['alpha', 'bravo']));

  await waitFor(() => expect(result.current.statuses.alpha?.status).toBe('loading'));
  expect(result.current.statuses.bravo?.status).toBe('loading');

  await act(async () => {
    first.resolve({ ...validStatus, issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }] });
    await first.promise;
  });

  await waitFor(() => expect(result.current.statuses.alpha?.status).toBe('success'));
  expect(result.current.statuses.bravo?.status).toBe('loading');

  act(() => result.current.retryStatus('alpha'));
  await waitFor(() => expect(vi.mocked(getStagingCertificateStatus)).toHaveBeenCalledTimes(3));
  await waitFor(() => expect(result.current.statuses.alpha).toEqual({
    status: 'success',
    data: { ...validStatus, hasPendingCertRequest: true },
  }));

  await act(async () => {
    second.resolve({ ...validStatus, hasMissingKeystore: true });
    await second.promise;
  });

  await waitFor(() => expect(result.current.statuses.bravo).toEqual({
    status: 'success',
    data: { ...validStatus, hasMissingKeystore: true },
  }));
});
