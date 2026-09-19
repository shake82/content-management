import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconFolderOff, IconRefresh } from '@tabler/icons-react';

interface StatusViewProps {
  kind: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
}

export function StatusView({ kind, message, onRetry }: StatusViewProps) {
  if (kind === 'loading') {
    return (
      <Center className="status-view" role="status">
        <Stack align="center" gap="sm">
          <Loader size="sm" />
          <Text c="dimmed" size="sm">{message ?? 'Loading vault catalog...'}</Text>
        </Stack>
      </Center>
    );
  }

  if (kind === 'error') {
    return (
      <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to load data">
        <Text size="sm">{message ?? 'An unexpected error occurred.'}</Text>
        {onRetry && (
          <Button mt="sm" size="xs" variant="light" leftSection={<IconRefresh size={15} />} onClick={onRetry}>
            Try again
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <Center className="status-view">
      <Stack align="center" gap="xs">
        <IconFolderOff size={28} color="var(--mantine-color-gray-5)" />
        <Text c="dimmed" size="sm">{message ?? 'No records found.'}</Text>
      </Stack>
    </Center>
  );
}
