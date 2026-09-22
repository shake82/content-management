import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { generateCertificateRequest } from '../../../api/toolsApi';
import { useGenerateCertificateRequest } from './useGenerateCertificateRequest';

vi.mock('../../../api/toolsApi', () => ({ generateCertificateRequest: vi.fn() }));

it('handles generation success, failure, and reset', async () => {
  const request = { subject: 'CN=service.example.gov', alternateSubjects: [] };
  const response = { privateKey: 'FAKE-KEY', certificateRequest: 'FAKE-CSR' };
  vi.mocked(generateCertificateRequest).mockResolvedValueOnce(response).mockRejectedValueOnce(new Error('Generation failed'));
  const { result } = renderHook(() => useGenerateCertificateRequest());

  await act(() => result.current.generateCertificateRequest(request));
  expect(result.current.status).toBe('success');
  expect(result.current.data).toEqual(response);

  await act(() => result.current.generateCertificateRequest(request));
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error?.message).toBe('Generation failed');

  act(() => result.current.reset());
  expect(result.current.status).toBe('idle');
});
