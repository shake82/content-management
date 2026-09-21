import { useCallback } from 'react';
import { getCertificateCatalog } from '../../api/certificateApi';
import { useApi } from '../../hooks/useApi';

export function useCertificateCatalog(pageNumber: number, pageSize: number, search: string) {
  const request = useCallback(
    () => getCertificateCatalog({ pageNumber, pageSize, search }),
    [pageNumber, pageSize, search],
  );

  return useApi(request, [pageNumber, pageSize, search]);
}
