import { ActionIcon, Alert, Button, Group, Input, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import { IconClipboard, IconSearch } from '@tabler/icons-react';
import { useId, useState } from 'react';

interface TextSecretInputProps {
  disabled?: boolean;
  loading?: boolean;
  onSubmit: (content: string) => void;
}

export function TextSecretInput({ disabled = false, loading = false, onSubmit }: TextSecretInputProps) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [clipboardError, setClipboardError] = useState<string>();

  const pasteFromClipboard = async () => {
    setClipboardError(undefined);
    if (!navigator.clipboard?.readText) {
      setClipboardError('Clipboard access is not available in this browser. You can paste into the field directly.');
      return;
    }

    try {
      setValue(await navigator.clipboard.readText());
    } catch {
      setClipboardError('Clipboard access was denied. You can paste into the field directly.');
    }
  };

  return (
    <Stack gap="md">
      <div>
        <Group gap={4} wrap="nowrap" mb={4}>
          <Input.Label htmlFor={inputId}>Secret Value</Input.Label>
          <Tooltip label="Paste from clipboard">
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label="Paste from clipboard"
              onClick={() => void pasteFromClipboard()}
              disabled={disabled}
            >
              <IconClipboard size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Textarea
          id={inputId}
          description="Paste Base64 encoded or plain PEM content."
          placeholder="-----BEGIN CERTIFICATE-----"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          rows={10}
          disabled={disabled}
        />
      </div>
      {clipboardError && <Alert color="orange" title="Clipboard unavailable">{clipboardError}</Alert>}
      <Group justify="flex-end" align="center">
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={() => onSubmit(value.trim())}
          disabled={disabled || !value.trim()}
          loading={loading}
        >
          Parse secret
        </Button>
      </Group>
      <Text size="xs" c="dimmed">Secret content is not stored in this browser or server.</Text>
    </Stack>
  );
}
