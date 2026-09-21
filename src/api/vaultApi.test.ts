import { beforeEach, expect, it, vi } from 'vitest';
import { getJson } from './apiClient';
import { getKeystoreComparison, VAULT_COMPARE_ENDPOINT } from './vaultApi';

vi.mock('./apiClient', () => ({
  getJson: vi.fn().mockResolvedValue({ keyEntries: [] }),
}));

beforeEach(() => {
  vi.mocked(getJson).mockClear();
});

it('requests a comparison between the current and selected versions', async () => {
  await getKeystoreComparison(42, 17, 16);

  expect(getJson).toHaveBeenCalledWith(`${VAULT_COMPARE_ENDPOINT}.json`, {
    params: {
      catalogId: 42,
      sourceVersion: 17,
      targetVersion: 16,
    },
  });
});
