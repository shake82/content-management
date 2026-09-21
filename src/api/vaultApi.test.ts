import { beforeEach, expect, it, vi } from 'vitest';
import { getJson } from './apiClient';
import {
  getKeystoreComparison,
  getKeystoreDetails,
  VAULT_COMPARE_ENDPOINT,
  VAULT_DETAIL_ENDPOINT,
} from './vaultApi';

vi.mock('./apiClient', () => ({
  getJson: vi.fn().mockResolvedValue({ keyEntries: [] }),
}));

beforeEach(() => {
  vi.mocked(getJson).mockClear();
});

it('requests a comparison between the current and selected versions', async () => {
  await getKeystoreComparison(
    { secretEngine: 'engine-a', path: 'apps/prod/payments', prop: 'store' },
    17,
    16,
  );

  expect(getJson).toHaveBeenCalledWith(`${VAULT_COMPARE_ENDPOINT}.json`, {
    params: {
      secretEngine: 'engine-a',
      path: 'apps/prod/payments',
      prop: 'store',
      sourceVersion: 17,
      targetVersion: 16,
    },
  });
});

it('requests keystore details using its secret location', async () => {
  const location = { secretEngine: 'engine-a', path: 'apps/prod/payments', prop: 'store' };

  await getKeystoreDetails(location);

  expect(getJson).toHaveBeenCalledWith(`${VAULT_DETAIL_ENDPOINT}.json`, {
    params: location,
  });
});
