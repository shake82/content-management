import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { KeystoreEntriesTable } from '../../vault/KeystoreEntriesTable';
import { IssueSeveritySummary } from './IssueSeveritySummary';
import type { ParsedSecretResponse } from './localCertViewerTypes';

interface ParsedSecretResultProps {
  result: ParsedSecretResponse;
  onReset: () => void;
}

export function ParsedSecretResult({ result, onReset }: ParsedSecretResultProps) {
  return (
    <Stack gap="md">
      <section aria-labelledby="parsed-secret-heading" className="local-cert-result-summary">
        <Group justify="space-between" align="flex-start" mb="md">
          <div>
            <Text className="page-eyebrow">Parsed secret</Text>
            <Group gap="sm">
              <Title id="parsed-secret-heading" order={2} size="h4">Parse result</Title>
              <Badge variant="outline" color="blue">{result.type}</Badge>
            </Group>
          </div>
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={onReset}>Parse another</Button>
        </Group>
        <Text size="sm" fw={600} mb="xs">Issue summary</Text>
        <IssueSeveritySummary summary={result.issueSeveritySummary} />
      </section>
      <KeystoreEntriesTable entries={result.keyEntries} subtitle={`${result.keyEntries.length} parsed entries`} />
    </Stack>
  );
}
