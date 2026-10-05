import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { generateKeyStore } from '../../api/stagingCertificateApi';
import { useGenerateKeyStore } from './useGenerateKeyStore';

vi.mock('../../api/stagingCertificateApi', () => ({ generateKeyStore: vi.fn() }));

beforeEach(() => {
  vi.mocked(generateKeyStore).mockReset();
});

it('submits keystore generation, exposes success data, captures errors, and resets state', async () => {
  const success = { hasMissingKeyStore: false, certificateRequestInfo: null };
  vi.mocked(generateKeyStore).mockResolvedValueOnce(success);
  const { result } = renderHook(() => useGenerateKeyStore('apps/prod/payments'));

  await act(async () => {
    await result.current.submit({ parentChain: 'chain' });
  });

  expect(generateKeyStore).toHaveBeenCalledWith('apps/prod/payments', { parentChain: 'chain' });
  expect(result.current.status).toBe('success');
  expect(result.current.data).toEqual(success);

  const error = new Error('Generate failed');
  vi.mocked(generateKeyStore).mockRejectedValueOnce(error);
  await act(async () => {
    await expect(result.current.submit({ parentChain: '' })).rejects.toThrow('Generate failed');
  });

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error).toBe(error);

  act(() => result.current.reset());
  expect(result.current.status).toBe('idle');
  expect(result.current.data).toBeUndefined();
  expect(result.current.error).toBeUndefined();
});
