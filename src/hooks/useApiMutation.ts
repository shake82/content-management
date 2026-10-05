import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import type { ApiStatus } from '../api/apiState';

interface ApiMutationState<TData> {
  status: ApiStatus;
  data?: TData;
  error?: Error;
}

interface UseApiMutationOptions {
  errorMessage?: string;
}

const initialState = { status: 'idle' } as const;

function getApiError(reason: unknown, fallbackMessage: string) {
  return reason instanceof Error ? reason : new Error(fallbackMessage);
}

export function useApiMutation<TPayload, TData>(
  request: (payload: TPayload) => Promise<TData>,
  dependencies: DependencyList = [],
  options: UseApiMutationOptions = {},
) {
  const requestRef = useRef(request);
  const requestId = useRef(0);
  const [state, setState] = useState<ApiMutationState<TData>>(initialState);
  const errorMessage = options.errorMessage ?? 'Unexpected API error';

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  const submit = useCallback(async (payload: TPayload) => {
    const activeRequest = ++requestId.current;
    setState({ status: 'loading' });

    try {
      const data = await requestRef.current(payload);
      if (requestId.current === activeRequest) setState({ status: 'success', data });
      return data;
    } catch (reason: unknown) {
      const error = getApiError(reason, errorMessage);
      if (requestId.current === activeRequest) setState({ status: 'error', error });
      throw error;
    }
  }, [errorMessage, ...dependencies]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState(initialState);
  }, []);

  return { ...state, submit, reset };
}
