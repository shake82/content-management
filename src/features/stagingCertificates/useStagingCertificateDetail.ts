import { getStagingCertificateDetail } from '../../api/stagingCertificateApi';
import { useApi } from '../../hooks/useApi';

export function useStagingCertificateDetail(path: string) {
  return useApi(() => {
    if (!path) return Promise.resolve(null);
    return getStagingCertificateDetail(path);
  }, [path]);
}
