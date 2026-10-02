import { Button, Group } from '@mantine/core';
import { IconKey, IconPlus } from '@tabler/icons-react';

interface StagingCertificateDetailActionsProps {
  hasMissingKeystore: boolean;
  onNewRequest: () => void;
  onGenerateKeystore: () => void;
}

export function StagingCertificateDetailActions({
  hasMissingKeystore,
  onNewRequest,
  onGenerateKeystore,
}: StagingCertificateDetailActionsProps) {
  return (
    <Group justify="flex-end" gap="xs">
      <Button leftSection={<IconPlus size={16} />} onClick={onNewRequest}>New</Button>
      {hasMissingKeystore && (
        <Button variant="light" leftSection={<IconKey size={16} />} onClick={onGenerateKeystore}>
          Generate Keystore
        </Button>
      )}
    </Group>
  );
}
