import { useCallback, useState } from 'react';
import { createStagingCertificate } from '../../api/stagingCertificateApi';
import type { ApiStatus } from '../../api/apiState';
import type { GenerateCertificateRequestPayload } from '../tools/certificateRequestGenerator/certificateRequestTypes';
import type { CreateStagingCertificateResponse } from './stagingCertificateTypes';

export function useCreateStagingCertificate() {
  const [status, setStatus] = useState<ApiStatus>('idle');
  const [data, setData] = useState<CreateStagingCertificateResponse>();
  const [error, setError] = useState<Error>();

  const submit = useCallback(async (payload: GenerateCertificateRequestPayload) => {
    setStatus('loading');
    setError(undefined);
    setData(undefined);
    try {
      const response = await createStagingCertificate(payload);
      setData(response);
      setStatus('success');
      return response;
    } catch (reason: unknown) {
      const nextError = reason instanceof Error ? reason : new Error('Unexpected API error');
      setError(nextError);
      setStatus('error');
      throw nextError;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(undefined);
    setError(undefined);
  }, []);

  return { status, data, error, submit, reset };
}
