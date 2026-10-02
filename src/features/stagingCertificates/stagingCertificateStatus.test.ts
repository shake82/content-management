import { expect, it } from 'vitest';
import {
  formatStagingCertificateIssue,
  getStagingCertificateIndicatorModel,
} from './stagingCertificateStatus';

it('uses the highest issue severity and maps workflow flags to indicator models', () => {
  const model = getStagingCertificateIndicatorModel({
    hasMissingKeyPair: true,
    hasMissingKeyStore: true,
    hasPendingCertRequest: false,
    issues: [
      { severity: 'MEDIUM', type: 'EXPIRING_SOON' },
      { severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' },
    ],
  });

  expect(model.validity.severity).toBe('HIGH');
  expect(model.workflow).toEqual(['missing-key-pair', 'missing-keystore']);
  expect(formatStagingCertificateIssue(model.validity.issues[1])).toBe('HIGH: Expired Certificate');
});
