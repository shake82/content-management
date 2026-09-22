import { Alert, Box, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { ParsedSecretResult } from './ParsedSecretResult';
import { SecretInputTabs } from './SecretInputTabs';
import { useParseSecret } from './useParseSecret';

export function LocalCertViewerPage() {
  const parser = useParseSecret();

  if (parser.status === 'success' && parser.data) {
    return (
      <Box maw={1200} mx="auto">
        <ParsedSecretResult result={parser.data} onReset={parser.reset} />
      </Box>
    );
  }

  return (
    <Box mx="auto">
      <Stack gap="md">
        <div className="page-heading">
          <Text className="page-eyebrow">Certificate tools</Text>
          <Title order={1} size="h2">Local Cert Viewer</Title>
          <Text c="dimmed" mt={4}>Inspect a local certificate, keystore, or encoded secret without adding it to the vault.</Text>
        </div>
        {parser.status === 'error' && (
          <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to parse secret" role="alert">
            {parser.error?.message ?? 'An unexpected error occurred.'}
          </Alert>
        )}
        {parser.status === 'loading' && (
          <Alert color="blue" title="Parsing secret" role="status">
            Inspecting certificate and keystore contents...
          </Alert>
        )}
        <section aria-label="Secret input" className="local-cert-input">
          <SecretInputTabs
            disabled={parser.status === 'loading'}
            loading={parser.status === 'loading'}
            onFileSubmit={(file) => void parser.parseSecret({ file, sourceType: 'file' })}
            onTextSubmit={(content) => void parser.parseSecret({ content, sourceType: 'text' })}
          />
        </section>
      </Stack>
    </Box>
  );
}
