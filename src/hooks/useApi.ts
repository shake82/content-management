import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiState } from '../api/apiState';

export function useApi<T>(request: () => Promise<T>): ApiState<T> {
  const requestRef = useRef(request);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<ApiState<T>, 'refetch'>>({ status: 'idle' });

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, status: 'loading', error: undefined }));

    requestRef.current()
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch((reason: unknown) => {
        if (active) {
          const error = reason instanceof Error ? reason : new Error('Unexpected API error');
          setState({ status: 'error', error });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const refetch = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, refetch };
}
