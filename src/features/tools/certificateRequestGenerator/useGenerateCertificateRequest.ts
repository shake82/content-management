import { useCallback } from 'react';
import { generateCertificateRequest as requestCertificateRequest } from '../../../api/toolsApi';
import { useApiMutation } from '../../../hooks/useApiMutation';
import type {
  GenerateCertificateRequestPayload,
  GenerateCertificateRequestResponse,
} from './certificateRequestTypes';

export function useGenerateCertificateRequest() {
  const { submit, ...mutation } = useApiMutation<
    GenerateCertificateRequestPayload,
    GenerateCertificateRequestResponse
  >(requestCertificateRequest, [], { errorMessage: 'Unable to generate the certificate request.' });

  const generateCertificateRequest = useCallback(async (request: GenerateCertificateRequestPayload) => {
    try {
      return await submit(request);
    } catch {
      return undefined;
    }
  }, [submit]);

  return { ...mutation, generateCertificateRequest };
}
