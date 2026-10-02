import { getStagingCertificateKeys } from '../../api/stagingCertificateApi';
import { useApi } from '../../hooks/useApi';

export function useStagingCertificateKeys() {
  return useApi(getStagingCertificateKeys);
}
