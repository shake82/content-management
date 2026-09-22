import { Alert, Box, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { CertificateRequestFields } from './CertificateRequestFields';
import { GeneratedPemResult } from './GeneratedPemResult';
import { useGenerateCertificateRequest } from './useGenerateCertificateRequest';

export function CertificateRequestGeneratorPage() {
  const generator = useGenerateCertificateRequest();

  if (generator.status === 'success' && generator.data) {
    return (
      <Box mx="auto">
        <section aria-label="Generated certificate request" className="certificate-request-section">
          <GeneratedPemResult result={generator.data} onReset={generator.reset} />
        </section>
      </Box>
    );
  }

  return (
    <Box mx="auto">
      <Stack gap="md">
        <div className="page-heading">
          <Text className="page-eyebrow">Certificate tools</Text>
          <Title order={1} size="h2">Certificate Request Generator</Title>
          <Text c="dimmed" mt={4}>Build a subject and generate a private key with a certificate signing request.</Text>
        </div>
        {generator.status === 'error' && (
          <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to generate request" role="alert">
            {generator.error?.message ?? 'An unexpected error occurred.'}
          </Alert>
        )}
        {generator.status === 'loading' && (
          <Alert color="blue" title="Generating request" role="status">
            Creating private key and certificate request...
          </Alert>
        )}
        <section aria-label="Certificate request details" className="certificate-request-section">
          <CertificateRequestFields
            disabled={generator.status === 'loading'}
            loading={generator.status === 'loading'}
            onSubmit={(request) => void generator.generateCertificateRequest(request)}
          />
        </section>
      </Stack>
    </Box>
  );
}
