import type { StagingCertificateDetail } from './stagingCertificateTypes';

export function shouldRequireParentChain(detail: StagingCertificateDetail) {
  return (detail.keyPair?.keyEntries?.[0]?.certificates?.length ?? 0) === 1;
}
