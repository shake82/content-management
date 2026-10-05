import { getCertificateStatuses } from './certificateStatus';
import type { KeystoreCertificate } from './detailTypes';

const certificate: KeystoreCertificate = {
  shortName: 'Certificate',
  startDate: '2026-01-01T00:00:000Z',
  endDate: '2026-12-31T00:00:000Z',
  revocationDate: null,
  version: 3,
  subject: 'CN=CERTIFICATE,C=US',
  issuer: 'CN=CERTIFICATE,C=US',
  hexSerialNumber: '0x01',
};

it('identifies expired and revoked certificates', () => {
  expect(getCertificateStatuses(
    { ...certificate, endDate: '2026-05-31T00:00:000Z', revocationDate: '2026-05-01T00:00:000Z' },
    new Date('2026-06-01T00:00:00Z'),
  )).toEqual(['Expired', 'Revoked']);
});

it('identifies certificates expiring within 30 days', () => {
  expect(getCertificateStatuses(
    { ...certificate, endDate: '2026-06-30T00:00:000Z' },
    new Date('2026-06-01T00:00:00Z'),
  )).toEqual(['Expiring']);
});

it('identifies certificates that have not started', () => {
  expect(getCertificateStatuses(
    { ...certificate, startDate: '2026-07-01T00:00:000Z' },
    new Date('2026-06-01T00:00:00Z'),
  )).toEqual(['Not Started']);
});
