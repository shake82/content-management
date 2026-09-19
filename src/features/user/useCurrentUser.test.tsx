import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { getCurrentUser } from '../../api/userApi';
import { useCurrentUser } from './useCurrentUser';

vi.mock('../../api/userApi', () => ({ getCurrentUser: vi.fn() }));

it('cycles from the called state to a successful current-user response', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: 'u1', displayName: 'Taylor Morgan', email: 'taylor@example.com', roles: ['Auditor'],
  });
  const { result } = renderHook(() => useCurrentUser());

  expect(['idle', 'loading']).toContain(result.current.status);
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.data?.displayName).toBe('Taylor Morgan');
  expect(result.current.error).toBeUndefined();
});
