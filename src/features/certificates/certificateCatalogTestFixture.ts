import type { CertificateCatalogPage } from './certificateCatalogTypes';

export const certificateCatalogFixture: CertificateCatalogPage = {
  content: [
    {
      id: 5,
      shortName: 'Payments leaf certificate',
      entryType: 'KEY_PAIR',
      expirationDate: '2027-01-28T00:00:000Z',
      certChainDetails: {
        certificates: [
          {
            shortName: 'Root CA',
            startDate: '2025-05-28T00:00:000Z',
            endDate: '2028-01-28T00:00:000Z',
            revocationDate: null,
            version: 3,
            subject: 'CN=ROOT,C=US',
            issuer: 'CN=ROOT,C=US',
            hexSerialNumber: '0x02',
            fingerprint: 'root-fingerprint',
          },
          {
            shortName: 'Payments leaf',
            startDate: '2025-05-28T00:00:000Z',
            endDate: '2027-01-28T00:00:000Z',
            revocationDate: null,
            version: 3,
            subject: 'CN=PAYMENTS,C=US',
            issuer: 'CN=ROOT,C=US',
            hexSerialNumber: '0x03',
            fingerprint: 'leaf-fingerprint',
          },
        ],
        issues: [{ type: 'EXPIRING_CERTIFICATE', severity: 'HIGH' }],
      },
      vaultReferences: [
        {
          catalogId: 12,
          path: 'apps/prod/payments',
          property: 'keystore',
          secretEngine: 'kubernetes',
          secretVersion: 5,
          type: 'JKS',
        },
      ],
    },
  ],
  first: true,
  last: false,
  number: 0,
  numberOfElements: 1,
  size: 15,
  totalElements: 18,
  totalPages: 2,
};
