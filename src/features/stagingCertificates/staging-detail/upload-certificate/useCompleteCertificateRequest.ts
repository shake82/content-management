import { completeCertificateRequest } from '../../../../api/stagingCertificateApi';
import { useApiMutation } from '../../../../hooks/useApiMutation';
import type {
  CompleteCertificateRequestPayload,
  StagingCertificateDetail,
} from '../../common/stagingCertificateTypes';

export function useCompleteCertificateRequest(path: string) {
  return useApiMutation<CompleteCertificateRequestPayload, StagingCertificateDetail>(
    (payload) => completeCertificateRequest(path, payload),
    [path],
  );
}
