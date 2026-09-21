import type { ParsedSecretResponse } from './localCertViewerTypes';

export const parsedSecretFixture: ParsedSecretResponse = {
  type: 'JKS',
  issueSeveritySummary: { HIGH: { EXPIRED_CERTIFICATE: 1 } },
  keyEntries: [
    {
      alias: 'payments-cert',
      entryType: 'TRUST_CERT',
      expirationDate: '2027-05-28T00:00:00Z',
      lastModifiedDate: '2025-05-28T00:00:00Z',
      issues: [],
      certificates: [
        {
          shortName: 'Payments certificate',
          startDate: '2025-05-28T00:00:00Z',
          endDate: '2027-05-28T00:00:00Z',
          revocationDate: null,
          version: 3,
          subject: 'CN=PAYMENTS,C=US',
          issuer: 'CN=PAYMENTS,C=US',
          hexSerialNumber: '0x01',
          fingerpring: 'fixture-fingerprint',
        },
      ],
    },
  ],
};
