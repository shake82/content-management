import type { KeystoreKeyEntry } from './detailTypes';

export function matchesKeystoreEntrySearch(entry: KeystoreKeyEntry | null, search: string) {
  if (!entry) return false;

  const query = search.trim().toLocaleLowerCase();
  if (!query) return true;

  const searchableValues = [
    entry.alias,
    ...(entry.certificates ?? []).flatMap((certificate) => [
      certificate.shortName,
      certificate.shortname,
      certificate.hexSerialNumber,
      certificate.subject,
    ]),
  ];

  return searchableValues.some((value) => value?.toLocaleLowerCase().includes(query));
}
