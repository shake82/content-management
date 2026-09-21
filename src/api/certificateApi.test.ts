import { beforeEach, expect, it, vi } from 'vitest';
import { certificateCatalogFixture } from '../features/certificates/certificateCatalogTestFixture';
import { mockGet } from './apiClient';
import { CERTIFICATE_CATALOG_ENDPOINT, getCertificateCatalog } from './certificateApi';

vi.mock('./apiClient', () => ({ mockGet: vi.fn() }));

beforeEach(() => {
  vi.mocked(mockGet).mockReset();
  vi.mocked(mockGet).mockResolvedValue(certificateCatalogFixture);
});

it('requests paged certificate results and includes only a non-empty search', async () => {
  await getCertificateCatalog({ pageNumber: 0, pageSize: 15 });
  await getCertificateCatalog({ pageNumber: 2, pageSize: 15, search: '  payments cert  ' });
  await getCertificateCatalog({ pageNumber: 1, pageSize: 15, search: '   ' });

  expect(mockGet).toHaveBeenNthCalledWith(
    1,
    `${CERTIFICATE_CATALOG_ENDPOINT}?pageNumber=0&pageSize=15`,
    expect.anything(),
  );
  expect(mockGet).toHaveBeenNthCalledWith(
    2,
    `${CERTIFICATE_CATALOG_ENDPOINT}?pageNumber=2&pageSize=15&search=payments+cert`,
    expect.anything(),
  );
  expect(mockGet).toHaveBeenNthCalledWith(
    3,
    `${CERTIFICATE_CATALOG_ENDPOINT}?pageNumber=1&pageSize=15`,
    expect.anything(),
  );
});
