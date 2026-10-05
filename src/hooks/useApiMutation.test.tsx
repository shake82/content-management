import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useApiMutation } from './useApiMutation';

it('submits mutations, exposes success data, captures errors, and resets state', async () => {
  const success = { id: 'created' };
  const request = vi.fn().mockResolvedValueOnce(success).mockRejectedValueOnce(new Error('Request failed'));
  const { result } = renderHook(() => useApiMutation<string, typeof success>(request));

  await act(async () => {
    await result.current.submit('payload');
  });

  expect(request).toHaveBeenCalledWith('payload');
  expect(result.current.status).toBe('success');
  expect(result.current.data).toEqual(success);

  await act(async () => {
    await expect(result.current.submit('broken')).rejects.toThrow('Request failed');
  });

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error?.message).toBe('Request failed');

  act(() => result.current.reset());
  expect(result.current.status).toBe('idle');
  expect(result.current.data).toBeUndefined();
  expect(result.current.error).toBeUndefined();
});

it('ignores stale mutation results after reset', async () => {
  let resolveRequest: (value: string) => void = () => undefined;
  const request = vi.fn(() => new Promise<string>((resolve) => {
    resolveRequest = resolve;
  }));
  const { result } = renderHook(() => useApiMutation<string, string>(request));

  void act(() => {
    void result.current.submit('payload');
  });
  expect(result.current.status).toBe('loading');

  act(() => result.current.reset());
  expect(result.current.status).toBe('idle');

  await act(async () => {
    resolveRequest('late response');
  });

  expect(result.current.status).toBe('idle');
  expect(result.current.data).toBeUndefined();
});
