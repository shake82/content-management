import { Alert, Box, Group, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { decodeStagingCertificatePath } from '../../../app/routes';
import { StatusView } from '../../../components/feedback/StatusView';
import { CompleteCertificateRequestModal } from './upload-certificate/CompleteCertificateRequestModal';
import { GenerateKeyStoreModal } from './generate-keystore/GenerateKeyStoreModal';
import { NewStagingCertificateModal } from '../common/NewStagingCertificateModal';
import { StagingCertificateBreadcrumbs } from './StagingCertificateBreadcrumbs';
import { StagingCertificateDetailActions } from './StagingCertificateDetailActions';
import { StagingCertificateKeyPairSection } from './StagingCertificateKeyPairSection';
import { StagingCertificateRequestBanner } from './StagingCertificateRequestBanner';
import { shouldRequireParentChain } from './generate-keystore/generateKeyStore';
import { useStagingCertificateDetail } from './useStagingCertificateDetail';

export function StagingCertificateDetailPage() {
  const params = useParams();
  const certificateKey = decodeStagingCertificatePath(params['*'] ?? '');
  const detail = useStagingCertificateDetail(certificateKey);
  const [uploadOpened, setUploadOpened] = useState(false);
  const [newRequestOpened, setNewRequestOpened] = useState(false);
  const [generateOpened, setGenerateOpened] = useState(false);

  if (!certificateKey) {
    return (
      <Box mx="auto">
        <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Missing staging certificate key">
          A staging certificate key is required to view details.
        </Alert>
      </Box>
    );
  }

  if (detail.status === 'idle' || detail.status === 'loading') {
    return <StatusView kind="loading" message="Loading staging certificate..." />;
  }

  if (detail.status === 'error') {
    return <StatusView kind="error" message={detail.error?.message} onRetry={detail.refetch} />;
  }

  if (!detail.data) {
    return <StatusView kind="empty" message="No staging certificate details found." />;
  }

  const requestInfo = detail.data.certificateRequestInfo;
  const parentChainRequired = shouldRequireParentChain(detail.data);

  return (
    <Box mx="auto">
      <Stack gap="lg">
        <StagingCertificateBreadcrumbs certificateKey={certificateKey} />
        <Group justify="space-between" align="flex-end" className="page-heading">
          <div>
            <Text className="page-eyebrow">Staging certificate</Text>
            <Title id="staging-certificate-detail-heading" order={1} size="h2">{certificateKey}</Title>
          </div>
          {!requestInfo && (
            <StagingCertificateDetailActions
              hasMissingKeyStore={detail.data.hasMissingKeyStore}
              onNewRequest={() => setNewRequestOpened(true)}
              onGenerateKeystore={() => setGenerateOpened(true)}
            />
          )}
        </Group>

        {requestInfo && (
          <StagingCertificateRequestBanner
            requestInfo={requestInfo}
            onUpload={() => setUploadOpened(true)}
          />
        )}

        <StagingCertificateKeyPairSection keyPair={detail.data.keyPair} />
      </Stack>

      {requestInfo && (
        <CompleteCertificateRequestModal
          opened={uploadOpened}
          path={certificateKey}
          onClose={() => setUploadOpened(false)}
          onSuccess={detail.refetch}
        />
      )}
      <NewStagingCertificateModal
        opened={newRequestOpened}
        onClose={() => setNewRequestOpened(false)}
        defaultCommonName={certificateKey}
        navigateOnSuccess={false}
        onSuccess={() => detail.refetch()}
      />
      {!requestInfo && (
        <GenerateKeyStoreModal
          opened={generateOpened}
          path={certificateKey}
          parentChainRequired={parentChainRequired}
          onClose={() => setGenerateOpened(false)}
          onSuccess={detail.refetch}
        />
      )}
    </Box>
  );
}
