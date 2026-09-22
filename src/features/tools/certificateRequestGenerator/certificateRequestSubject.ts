import type { CertificateSubjectEntry, SubjectCode } from './certificateRequestTypes';

export const SUBJECT_OPTIONS: ReadonlyArray<{ value: SubjectCode; label: string }> = [
  { value: 'CN', label: 'Common Name (CN)' },
  { value: 'OU', label: 'Organizational Unit (OU)' },
  { value: 'O', label: 'Organization (O)' },
  { value: 'L', label: 'Locality (L)' },
  { value: 'ST', label: 'State (ST)' },
  { value: 'C', label: 'Country (C)' },
];

export const SUBJECT_ORDER: readonly SubjectCode[] = ['CN', 'OU', 'O', 'L', 'ST', 'C'];

export const DEFAULT_SUBJECTS: readonly CertificateSubjectEntry[] = [
  { code: 'OU', value: 'Devices' },
  { code: 'OU', value: 'USCIS' },
  { code: 'OU', value: 'Department of Homeland Security' },
  { code: 'O', value: 'U.S. Government' },
  { code: 'C', value: 'US' },
];

export function sortSubjectEntries<T extends CertificateSubjectEntry>(entries: readonly T[]): T[] {
  return SUBJECT_ORDER.flatMap((code) => entries.filter((entry) => entry.code === code));
}

export function formatSubjectEntry(entry: CertificateSubjectEntry): string {
  return `${entry.code}=${entry.value.trim()}`;
}

export function serializeSubject(entries: readonly CertificateSubjectEntry[]): string {
  return sortSubjectEntries(entries).map(formatSubjectEntry).join(',');
}

export function hasCommonName(entries: readonly CertificateSubjectEntry[]): boolean {
  return entries.some((entry) => entry.code === 'CN' && entry.value.trim().length > 0);
}

export function parseAlternateSubjects(value: string): string[] {
  return value.split(/\r?\n/).map((subject) => subject.trim()).filter(Boolean);
}
