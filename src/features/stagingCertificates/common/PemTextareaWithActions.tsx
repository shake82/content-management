import { ActionIcon, Alert, Group, Input, Textarea, Tooltip } from '@mantine/core';
import { IconClipboard, IconFileUpload } from '@tabler/icons-react';
import { type ChangeEvent, useId, useRef, useState } from 'react';

interface PemTextareaWithActionsProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PemTextareaWithActions({
  label,
  required = false,
  value,
  onChange,
  disabled = false,
}: PemTextareaWithActionsProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  const pasteFromClipboard = async () => {
    setError(undefined);
    if (!navigator.clipboard?.readText) {
      setError('Clipboard access is not available in this browser. You can paste into the field directly.');
      return;
    }

    try {
      onChange(await navigator.clipboard.readText());
    } catch {
      setError('Clipboard access was denied. You can paste into the field directly.');
    }
  };

  const readSelectedFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    setError(undefined);
    if (!file) return;
    if (file.size === 0) {
      setError('The selected file is empty.');
      return;
    }

    try {
      onChange(await file.text());
    } catch {
      setError('The selected file could not be read.');
    }
  };

  return (
    <div>
      <Group gap={4} wrap="nowrap" mb={4}>
        <Input.Label htmlFor={inputId} required={required}>{label}</Input.Label>
        <Tooltip label={`Paste ${label.toLocaleLowerCase()} from clipboard`}>
          <ActionIcon
            variant="subtle"
            size="sm"
            aria-label={`Paste ${label} from clipboard`}
            onClick={() => void pasteFromClipboard()}
            disabled={disabled}
          >
            <IconClipboard size={15} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={`Load ${label.toLocaleLowerCase()} from file`}>
          <ActionIcon
            variant="subtle"
            size="sm"
            aria-label={`Load ${label} from file`}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <IconFileUpload size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Textarea
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="-----BEGIN CERTIFICATE-----"
        rows={8}
        disabled={disabled}
        aria-label={label}
      />
      <input
        ref={fileInputRef}
        className="staging-certificate-pem-file-input"
        type="file"
        aria-label={`Choose ${label} file`}
        onChange={(event) => void readSelectedFile(event)}
        disabled={disabled}
      />
      {error && <Alert color="orange" title="Unable to load content" mt="xs">{error}</Alert>}
    </div>
  );
}
