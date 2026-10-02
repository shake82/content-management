import { Alert, Box, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { StagingCertificateBreadcrumbs } from './StagingCertificateBreadcrumbs';

export function StagingCertificateDetailPage() {
  const [searchParams] = useSearchParams();
  const certificateKey = searchParams.get('key') ?? '';

  if (!certificateKey) {
    return (
      <Box mx="auto">
        <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Missing staging certificate key">
          A staging certificate key is required to view details.
        </Alert>
      </Box>
    );
  }

  return (
    <Box mx="auto">
      <Stack gap="md">
        <StagingCertificateBreadcrumbs certificateKey={certificateKey} />
        <section aria-labelledby="staging-certificate-detail-heading">
          <Text className="page-eyebrow">Staging certificate</Text>
          <Title id="staging-certificate-detail-heading" order={1} size="h2">{certificateKey}</Title>
        </section>
      </Stack>
    </Box>
  );
}
