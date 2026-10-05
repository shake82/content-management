import { expect, it } from 'vitest';
import {
  filterStagingCertificateKeys,
  getTotalPages,
  paginateKeys,
} from './stagingCertificateFiltering';

it('filters by trimmed case-insensitive names and paginates client-side results', () => {
  const keys = ['apps/prod/payments', 'apps/dev/search', 'infra/prod/gateway'];
  const filtered = filterStagingCertificateKeys(keys, ' PROD ');

  expect(filtered).toEqual(['apps/prod/payments', 'infra/prod/gateway']);
  expect(filterStagingCertificateKeys(keys, '   ')).toBe(keys);
  expect(paginateKeys(keys, 1, 2)).toEqual(['infra/prod/gateway']);
  expect(getTotalPages(0, 15)).toBe(1);
  expect(getTotalPages(31, 15)).toBe(3);
});
