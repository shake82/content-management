import { KeystoreEntriesTable } from '../vault/KeystoreEntriesTable';
import type { KeystoreKeyEntry } from '../vault/detailTypes';
import type { StagingCertificateKeyPair } from './stagingCertificateTypes';

interface StagingCertificateKeyPairSectionProps {
  keyPair?: StagingCertificateKeyPair;
}

function normalizeEntries(entries: KeystoreKeyEntry[]) {
  return entries.map((entry) => ({
    ...entry,
    certificates: entry.certificates ?? [],
    issues: entry.issues ?? [],
    expirationDate: entry.expirationDate ?? null,
    lastModifiedDate: entry.lastModifiedDate ?? null,
  }));
}

export function StagingCertificateKeyPairSection({ keyPair }: StagingCertificateKeyPairSectionProps) {
  if (!keyPair) return null;

  return (
    <KeystoreEntriesTable
      entries={normalizeEntries(keyPair.keyEntries ?? [])}
      title="Key pair entries"
      enableFilters={false}
      showHeader={false}
    />
  );
}
