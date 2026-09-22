import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import type { GenerateCertificateRequestResponse } from './certificateRequestTypes';
import { PemActionButtons } from './PemActionButtons';

interface GeneratedPemResultProps {
  result: GenerateCertificateRequestResponse;
  onReset: () => void;
}

interface PemBlockProps {
  contents: string;
  fileName: string;
  label: string;
}

function PemBlock({ contents, fileName, label }: PemBlockProps) {
  return (
    <div className="certificate-request-pem-block">
      <Group justify="space-between" align="center" mb="xs">
        <Text fw={600}>{label}</Text>
        <PemActionButtons contents={contents} fileName={fileName} label={label.toLowerCase()} />
      </Group>
      <pre tabIndex={0} aria-label={`${label} PEM`}>{contents}</pre>
    </div>
  );
}

export function GeneratedPemResult({ result, onReset }: GeneratedPemResultProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text className="page-eyebrow">Generated files</Text>
          <Title order={2} size="h4">Certificate request result</Title>
        </div>
        <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={onReset}>Generate another</Button>
      </Group>
      <div className="certificate-request-results">
        <PemBlock contents={result.privateKey} fileName="private.pem" label="Private key" />
        <PemBlock contents={result.certificateRequest} fileName="certificate-request.pem" label="Certificate request" />
      </div>
      <Text size="xs" c="dimmed">Private key material is shown only for this result and is not stored in the browser.</Text>
    </Stack>
  );
}
