import { expect, it } from 'vitest';
import { shouldRequireParentChain } from './generateKeyStore';
import type { StagingCertificateDetail } from '../../common/stagingCertificateTypes';

function detailWithCertificates(certificates: unknown[] | null): StagingCertificateDetail {
  return {
    hasMissingKeyStore: true,
    certificateRequestInfo: null,
    keyPair: {
      type: 'PEM',
      keyEntries: [{
        alias: 'Primary',
        entryType: 'KEY_PAIR',
        expirationDate: null,
        issues: [],
        lastModifiedDate: null,
        certificates: certificates as never,
      }],
    },
  };
}

it('requires a parent chain only when the first key entry contains exactly one certificate', () => {
  expect(shouldRequireParentChain(detailWithCertificates([{}]))).toBe(true);
  expect(shouldRequireParentChain(detailWithCertificates([{}, {}]))).toBe(false);
  expect(shouldRequireParentChain(detailWithCertificates([]))).toBe(false);
  expect(shouldRequireParentChain(detailWithCertificates(null))).toBe(false);
  expect(shouldRequireParentChain({ hasMissingKeyStore: true, certificateRequestInfo: null })).toBe(false);
});
