import { generateKeyStore } from '../../../../api/stagingCertificateApi';
import { useApiMutation } from '../../../../hooks/useApiMutation';
import type {
  GenerateKeyStorePayload,
  StagingCertificateDetail,
} from '../../common/stagingCertificateTypes';

export function useGenerateKeyStore(path: string) {
  return useApiMutation<GenerateKeyStorePayload, StagingCertificateDetail>(
    (payload) => generateKeyStore(path, payload),
    [path],
  );
}
