import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { parseSecret } from '../../../api/toolsApi';
import { parsedSecretFixture } from './localCertViewerTestFixture';
import { useParseSecret } from './useParseSecret';

vi.mock('../../../api/toolsApi', () => ({ parseSecret: vi.fn() }));

it('handles successful parsing, failures, and reset', async () => {
  vi.mocked(parseSecret).mockResolvedValueOnce(parsedSecretFixture).mockRejectedValueOnce(new Error('Invalid secret'));
  const { result } = renderHook(() => useParseSecret());

  await act(() => result.current.parseSecret({ content: 'pem', sourceType: 'text' }));
  expect(result.current.status).toBe('success');
  expect(result.current.data).toEqual(parsedSecretFixture);

  await act(() => result.current.parseSecret({ content: 'bad', sourceType: 'text' }));
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error?.message).toBe('Invalid secret');

  act(() => result.current.reset());
  expect(result.current.status).toBe('idle');
});
