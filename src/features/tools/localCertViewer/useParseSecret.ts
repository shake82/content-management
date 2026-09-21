import { useCallback, useRef, useState } from 'react';
import { parseSecret as requestParseSecret } from '../../../api/toolsApi';
import type { ParseSecretRequest, ParsedSecretResponse } from './localCertViewerTypes';

type ParseStatus = 'idle' | 'loading' | 'success' | 'error';

interface ParseState {
  status: ParseStatus;
  data?: ParsedSecretResponse;
  error?: Error;
}

const initialState: ParseState = { status: 'idle' };

export function useParseSecret() {
  const [state, setState] = useState<ParseState>(initialState);
  const requestId = useRef(0);

  const parseSecret = useCallback(async (request: ParseSecretRequest) => {
    const activeRequest = ++requestId.current;
    setState({ status: 'loading' });

    try {
      const data = await requestParseSecret(request);
      if (requestId.current === activeRequest) setState({ status: 'success', data });
      return data;
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error('Unable to parse this secret.');
      if (requestId.current === activeRequest) setState({ status: 'error', error });
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState(initialState);
  }, []);

  return { ...state, parseSecret, reset };
}
