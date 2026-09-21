import {
  getCertificateStatuses,
  parseKeystoreDate,
  type CertificateStatus,
} from '../vault/certificateStatus';
import type { KeystoreIssue } from '../vault/detailTypes';
import type { CertificateCatalogItem } from './certificateCatalogTypes';

export interface CertificateCatalogValidity {
  isValid: boolean;
  severity: 'success' | 'warning' | 'error';
  issues: string[];
}

function formatIssue(issue: KeystoreIssue) {
  const description = issue.type.replaceAll('_', ' ').toLocaleLowerCase();
  return `${issue.severity.toUpperCase()}: ${description}`;
}

export function getCertificateCatalogValidity(
  item: CertificateCatalogItem,
  now = new Date(),
): CertificateCatalogValidity {
  const explicitIssues = (item.issues ?? []).map(formatIssue);
  if (explicitIssues.length > 0) {
    return { isValid: false, severity: 'error', issues: explicitIssues };
  }

  const statuses = new Set(item.certificates.flatMap((certificate) => getCertificateStatuses(certificate, now)));
  const invalidStatusNames: CertificateStatus[] = ['Expired', 'Not Started', 'Revoked'];
  const invalidStatuses = invalidStatusNames.filter((status) => statuses.has(status));
  if (invalidStatuses.length > 0) {
    return {
      isValid: false,
      severity: 'error',
      issues: invalidStatuses.map((status) => `Certificate is ${status.toLocaleLowerCase()}.`),
    };
  }

  if (statuses.has('Expiring')) {
    return {
      isValid: true,
      severity: 'warning',
      issues: ['Certificate expires within 30 days.'],
    };
  }

  return { isValid: true, severity: 'success', issues: [] };
}

export function formatCertificateDate(value: string | null) {
  if (!value) return 'None';
  const date = parseKeystoreDate(value);
  return date
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
    : value;
}
