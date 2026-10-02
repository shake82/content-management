import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getStagingCertificateStatus,
  STAGING_CERTIFICATE_STATUS_CONCURRENCY,
} from '../../api/stagingCertificateApi';
import { runWithConcurrencyLimit } from './stagingCertificateConcurrency';
import type {
  StagingCertificateStatusByKey,
  StagingCertificateStatusLoadState,
} from './stagingCertificateTypes';

export function useRenderedStagingCertificateStatuses(visibleKeys: string[]) {
  const [statuses, setStatuses] = useState<StagingCertificateStatusByKey>({});
  const statusesRef = useRef(statuses);
  const requestIdRef = useRef(0);
  const visibleKeySignature = useMemo(() => visibleKeys.join('\u001f'), [visibleKeys]);

  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  useEffect(() => {
    const keysToLoad = visibleKeys.filter((key) => {
      const existing = statusesRef.current[key];
      return !existing || existing.status === 'idle';
    });

    if (keysToLoad.length === 0) return undefined;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let active = true;

    setStatuses((current) => {
      const next = { ...current };
      keysToLoad.forEach((key) => {
        next[key] = { status: 'loading' };
      });
      return next;
    });

    void runWithConcurrencyLimit(
      keysToLoad,
      STAGING_CERTIFICATE_STATUS_CONCURRENCY,
      getStagingCertificateStatus,
    ).then((results) => {
      if (!active || requestIdRef.current !== requestId) return;
      setStatuses((current) => {
        const next: StagingCertificateStatusByKey = { ...current };
        results.forEach(({ input, result, error }) => {
          next[input] = error
            ? { status: 'error', error }
            : { status: 'success', data: result! };
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [statuses, visibleKeySignature, visibleKeys]);

  const retryStatus = useCallback((key: string) => {
    setStatuses((current) => ({
      ...current,
      [key]: { status: 'idle' } satisfies StagingCertificateStatusLoadState,
    }));
  }, []);

  return { statuses, retryStatus };
}
