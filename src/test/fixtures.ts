import type { VaultCatalogItem } from '../features/vault/catalogTypes';

export const catalogFixture: VaultCatalogItem[] = [
  {
    catalogId: 1,
    secretEngine: 'engine-a',
    path: 'apps/prod/payments',
    secretVersion: 2,
    property: 'store',
    type: 'JKS',
    secretSummary: {
      type: 'JKS',
      keyCountByType: { KEY_PAIR: 1 },
      issueSummaryBySeverity: {
        HIGH: { count: 1, issueCountsByType: { EXPIRED_CERTIFICATE: 1 } },
      },
    },
  },
  {
    catalogId: 2,
    secretEngine: 'engine-b',
    path: 'apps/dev/search',
    secretVersion: 4,
    property: 'truststore',
    type: 'PKCS12',
    secretSummary: {
      type: 'PKCS12',
      keyCountByType: { TRUSTED_CERTIFICATE: 2 },
      issueSummaryBySeverity: {
        LOW: { count: 2, issueCountsByType: { EXPIRING_SOON: 2 } },
      },
    },
  },
  {
    catalogId: 3,
    secretEngine: 'engine-c',
    path: 'infra/network',
    secretVersion: 1,
    property: 'bundle',
    type: 'PEM_BUNDLE',
    secretSummary: {
      type: 'PEM_BUNDLE',
      keyCountByType: { CERTIFICATE: 3 },
      issueSummaryBySeverity: {},
    },
  },
];
