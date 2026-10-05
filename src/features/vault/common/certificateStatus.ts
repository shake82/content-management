import type { KeystoreCertificate } from './detailTypes';

export type CertificateStatus = 'Expired' | 'Expiring' | 'Not Started' | 'Revoked';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function parseKeystoreDate(value: string | null) {
  if (!value) return null;

  const normalizedValue = value.replace(/T(\d{2}):(\d{2}):(\d{3})Z$/, 'T$1:$2:00.$3Z');
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getCertificateStatuses(certificate: KeystoreCertificate, now = new Date()): CertificateStatus[] {
  const statuses: CertificateStatus[] = [];
  const startDate = parseKeystoreDate(certificate.startDate);
  const endDate = parseKeystoreDate(certificate.endDate);

  if (endDate && endDate.getTime() < now.getTime()) {
    statuses.push('Expired');
  } else if (endDate && endDate.getTime() <= now.getTime() + THIRTY_DAYS_MS) {
    statuses.push('Expiring');
  }

  if (startDate && startDate.getTime() > now.getTime()) {
    statuses.push('Not Started');
  }

  if (certificate.revocationDate) {
    statuses.push('Revoked');
  }

  return statuses;
}
