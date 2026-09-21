import { beforeEach, expect, it, vi } from 'vitest';
import { mockGet } from './apiClient';
import { getKeystoreComparison, VAULT_COMPARE_ENDPOINT } from './vaultApi';

vi.mock('./apiClient', () => ({
  mockGet: vi.fn().mockResolvedValue({ keyEntries: [] }),
}));

beforeEach(() => {
  vi.mocked(mockGet).mockClear();
});

it('requests a comparison between the current and selected versions', async () => {
  await getKeystoreComparison(42, 17, 16);

  expect(mockGet).toHaveBeenCalledWith(
    `${VAULT_COMPARE_ENDPOINT}?catalogId=42&sourceVersion=17&targetVersion=16`,
    expect.anything(),
  );
});
