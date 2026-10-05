import { useCallback, useState } from 'react';
import { generateKeyStore } from '../../api/stagingCertificateApi';
import type { ApiStatus } from '../../api/apiState';
import type {
  GenerateKeyStorePayload,
  StagingCertificateDetail,
} from './stagingCertificateTypes';

export function useGenerateKeyStore(path: string) {
  const [status, setStatus] = useState<ApiStatus>('idle');
  const [data, setData] = useState<StagingCertificateDetail>();
  const [error, setError] = useState<Error>();

  const submit = useCallback(async (payload: GenerateKeyStorePayload) => {
    setStatus('loading');
    setError(undefined);
    setData(undefined);
    try {
      const response = await generateKeyStore(path, payload);
      setData(response);
      setStatus('success');
      return response;
    } catch (reason: unknown) {
      const nextError = reason instanceof Error ? reason : new Error('Unexpected API error');
      setError(nextError);
      setStatus('error');
      throw nextError;
    }
  }, [path]);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(undefined);
    setError(undefined);
  }, []);

  return { status, data, error, submit, reset };
}
