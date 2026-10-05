import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconDeviceDesktop, IconExternalLink, IconUpload } from '@tabler/icons-react';
import { DEVICE_ENROLLMENT_URL } from '../common/stagingCertificateConfig';
import type { StagingCertificateRequestInfo } from '../common/stagingCertificateTypes';

interface StagingCertificateRequestBannerProps {
  requestInfo: StagingCertificateRequestInfo;
  onUpload: () => void;
}

export function StagingCertificateRequestBanner({
  requestInfo,
  onUpload,
}: StagingCertificateRequestBannerProps) {
  return (
    <Alert color="blue" title="Pending certificate request">
      <Stack gap="sm">
        <Text size="sm">
          There is a current pending certificate request. Upload a new certificate response to generate a key pair.
        </Text>
        <Group gap="xs">
          <Button
            component="a"
            href={requestInfo.vaultPath}
            target="_blank"
            rel="noreferrer"
            variant="light"
            leftSection={<IconExternalLink size={16} />}
          >
            View In Vault
          </Button>
          <Button
            component="a"
            href={DEVICE_ENROLLMENT_URL}
            target="_blank"
            rel="noreferrer"
            variant="light"
            leftSection={<IconDeviceDesktop size={16} />}
          >
            Device enrollment
          </Button>
          <Button leftSection={<IconUpload size={16} />} onClick={onUpload}>
            Upload Certificate
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
