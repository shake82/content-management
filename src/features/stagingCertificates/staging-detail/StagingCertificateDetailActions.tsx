import { Button, Group } from '@mantine/core';
import { IconKey, IconPlus } from '@tabler/icons-react';

interface StagingCertificateDetailActionsProps {
  hasMissingKeyStore: boolean;
  onNewRequest: () => void;
  onGenerateKeystore: () => void;
}

export function StagingCertificateDetailActions({
  hasMissingKeyStore,
  onNewRequest,
  onGenerateKeystore,
}: StagingCertificateDetailActionsProps) {
  return (
    <Group justify="flex-end" gap="xs">
      <Button leftSection={<IconPlus size={16} />} onClick={onNewRequest}>New</Button>
      {hasMissingKeyStore && (
        <Button variant="light" leftSection={<IconKey size={16} />} onClick={onGenerateKeystore}>
          Generate Keystore
        </Button>
      )}
    </Group>
  );
}
