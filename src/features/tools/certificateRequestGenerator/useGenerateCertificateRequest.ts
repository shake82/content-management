import { useCallback, useRef, useState } from 'react';
import { generateCertificateRequest as requestCertificateRequest } from '../../../api/toolsApi';
import type {
  GenerateCertificateRequestPayload,
  GenerateCertificateRequestResponse,
} from './certificateRequestTypes';

type GenerateStatus = 'idle' | 'loading' | 'success' | 'error';

interface GenerateState {
  status: GenerateStatus;
  data?: GenerateCertificateRequestResponse;
  error?: Error;
}

const initialState: GenerateState = { status: 'idle' };

export function useGenerateCertificateRequest() {
  const [state, setState] = useState<GenerateState>(initialState);
  const requestId = useRef(0);

  const generateCertificateRequest = useCallback(async (request: GenerateCertificateRequestPayload) => {
    const activeRequest = ++requestId.current;
    setState({ status: 'loading' });
    try {
      const data = await requestCertificateRequest(request);
      if (requestId.current === activeRequest) setState({ status: 'success', data });
      return data;
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error('Unable to generate the certificate request.');
      if (requestId.current === activeRequest) setState({ status: 'error', error });
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState(initialState);
  }, []);

  return { ...state, generateCertificateRequest, reset };
}
