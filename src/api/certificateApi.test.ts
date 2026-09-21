import { beforeEach, expect, it, vi } from 'vitest';
import { certificateCatalogFixture } from '../features/certificates/certificateCatalogTestFixture';
import { getJson } from './apiClient';
import { CERTIFICATE_CATALOG_ENDPOINT, getCertificateCatalog } from './certificateApi';

vi.mock('./apiClient', () => ({ getJson: vi.fn() }));

beforeEach(() => {
  vi.mocked(getJson).mockReset();
  vi.mocked(getJson).mockResolvedValue(certificateCatalogFixture);
});

it('requests paged certificate results and includes only a non-empty search', async () => {
  await getCertificateCatalog({ pageNumber: 0, pageSize: 15 });
  await getCertificateCatalog({ pageNumber: 2, pageSize: 15, search: '  payments cert  ' });
  await getCertificateCatalog({ pageNumber: 1, pageSize: 15, search: '   ' });

  expect(getJson).toHaveBeenNthCalledWith(1, `${CERTIFICATE_CATALOG_ENDPOINT}.json`, expect.anything());
  expect(getJson).toHaveBeenNthCalledWith(2, `${CERTIFICATE_CATALOG_ENDPOINT}.json`, expect.anything());
  expect(getJson).toHaveBeenNthCalledWith(3, `${CERTIFICATE_CATALOG_ENDPOINT}.json`, expect.anything());

  expect(vi.mocked(getJson).mock.calls[0][1]?.params.toString()).toBe('pageNumber=0&pageSize=15');
  expect(vi.mocked(getJson).mock.calls[1][1]?.params.toString()).toBe(
    'pageNumber=2&pageSize=15&search=payments+cert',
  );
  expect(vi.mocked(getJson).mock.calls[2][1]?.params.toString()).toBe('pageNumber=1&pageSize=15');
});
