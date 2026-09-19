import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { getVaultCatalog } from '../../api/vaultApi';
import { catalogFixture } from '../../test/fixtures';
import { useVaultCatalog } from './useVaultCatalog';

vi.mock('../../api/vaultApi', () => ({ getVaultCatalog: vi.fn() }));

it('loads the complete catalog and exposes a refetch action', async () => {
  vi.mocked(getVaultCatalog).mockResolvedValue(catalogFixture);
  const { result } = renderHook(() => useVaultCatalog());

  expect(['idle', 'loading']).toContain(result.current.status);
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.data).toHaveLength(3);
  expect(result.current.refetch).toEqual(expect.any(Function));
});
