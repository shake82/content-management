import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getStagingCertificateStatus,
  STAGING_CERTIFICATE_STATUS_CONCURRENCY,
} from '../../../api/stagingCertificateApi';
import type {
  StagingCertificateStatusByKey,
  StagingCertificateStatusLoadState,
} from '../common/stagingCertificateTypes';

export function useRenderedStagingCertificateStatuses(visibleKeys: string[]) {
  const [statuses, setStatuses] = useState<StagingCertificateStatusByKey>({});
  const [retryAttempt, setRetryAttempt] = useState(0);
  const statusesRef = useRef(statuses);
  const mountedRef = useRef(true);
  // Depend on the key contents, not the array identity; callers often create a new array on each render.
  const visibleKeySignature = useMemo(() => visibleKeys.join('\u001f'), [visibleKeys]);

  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  useEffect(() => {
    // React development mode can mount, clean up, and remount effects; reset before starting workers.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const keysToLoad = visibleKeys.filter((key) => {
      const existing = statusesRef.current[key];
      return !existing || existing.status === 'idle';
    });

    if (keysToLoad.length === 0) return undefined;

    // Shared by the worker functions below so only three status requests are active at a time.
    let nextIndex = 0;

    setStatuses((current) => {
      const next = { ...current };
      keysToLoad.forEach((key) => {
        next[key] = { status: 'loading' };
      });
      return next;
    });

    // Each worker publishes its own result immediately, then pulls another key from the queue.
    async function runNext(): Promise<void> {
      const key = keysToLoad[nextIndex];
      nextIndex += 1;
      if (!key) return;

      try {
        const status = await getStagingCertificateStatus(key);
        if (mountedRef.current) {
          setStatuses((current) => ({
            ...current,
            [key]: { status: 'success', data: status },
          }));
        }
      } catch (reason: unknown) {
        if (mountedRef.current) {
          setStatuses((current) => ({
            ...current,
            [key]: {
              status: 'error',
              error: reason instanceof Error ? reason : new Error('Unexpected API error'),
            },
          }));
        }
      }

      if (mountedRef.current) await runNext();
    }

    void Promise.all(
      Array.from(
        { length: Math.min(STAGING_CERTIFICATE_STATUS_CONCURRENCY, keysToLoad.length) },
        () => runNext(),
      ),
    );

    return undefined;
  }, [retryAttempt, visibleKeySignature]);

  const retryStatus = useCallback((key: string) => {
    setStatuses((current) => ({
      ...current,
      [key]: { status: 'idle' } satisfies StagingCertificateStatusLoadState,
    }));
    // Bump a separate trigger because mutating the status cache alone should not be an effect dependency.
    setRetryAttempt((attempt) => attempt + 1);
  }, []);

  return { statuses, retryStatus };
}
