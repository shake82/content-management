import { expect, it } from 'vitest';
import { certificateCatalogFixture } from './certificateCatalogTestFixture';
import { formatCertificateDate, getCertificateCatalogValidity } from './certificateCatalogStatus';

it('reports explicit and derived certificate validity and formats catalog dates', () => {
  const item = certificateCatalogFixture.content[0]!;
  const explicit = getCertificateCatalogValidity(item, new Date('2026-01-01T00:00:00Z'));
  const expired = getCertificateCatalogValidity(
    {
      ...item,
      issues: [],
      certificates: [{ ...item.certificates[0]!, endDate: '2020-01-01T00:00:000Z' }],
    },
    new Date('2026-01-01T00:00:00Z'),
  );
  const valid = getCertificateCatalogValidity(
    { ...item, issues: [], certificates: item.certificates },
    new Date('2026-01-01T00:00:00Z'),
  );

  expect(explicit).toMatchObject({ isValid: false, severity: 'error' });
  expect(explicit.issues).toContain('HIGH: expiring certificate');
  expect(expired.issues).toContain('Certificate is expired.');
  expect(valid).toEqual({ isValid: true, severity: 'success', issues: [] });
  expect(formatCertificateDate('2027-01-28T00:00:000Z')).toBe('Jan 28, 2027');
  expect(formatCertificateDate(null)).toBe('None');
});
