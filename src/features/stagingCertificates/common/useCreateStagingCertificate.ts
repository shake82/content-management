import { createStagingCertificate } from '../../../api/stagingCertificateApi';
import { useApiMutation } from '../../../hooks/useApiMutation';
import type { GenerateCertificateRequestPayload } from '../../tools/certificateRequestGenerator/certificateRequestTypes';
import type { CreateStagingCertificateResponse } from './stagingCertificateTypes';

export function useCreateStagingCertificate() {
  return useApiMutation<GenerateCertificateRequestPayload, CreateStagingCertificateResponse>(
    createStagingCertificate,
  );
}
