import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconFileUpload, IconUpload } from '@tabler/icons-react';
import { type ChangeEvent, type DragEvent, type KeyboardEvent, type MouseEvent, useRef, useState } from 'react';

interface FileSecretInputProps {
  disabled?: boolean;
  onSubmit: (file: File) => void;
}

export function FileSecretInput({ disabled = false, onSubmit }: FileSecretInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string>();

  const readFile = (file?: File) => {
    if (!file || disabled) return;
    setFileName(file.name);
    setError(undefined);

    if (file.size === 0) {
      setError('The selected file is empty.');
      return;
    }

    onSubmit(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void readFile(event.dataTransfer.files[0]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled && event.target !== inputRef.current) inputRef.current?.click();
  };

  return (
    <Stack gap="md">
      <div
        className="local-cert-dropzone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <IconFileUpload size={34} aria-hidden />
        <Text fw={600}>Drop a certificate or secret file here</Text>
        <Text size="sm" c="dimmed">The file is sent only when selected.</Text>
        <Button
          component="span"
          variant="light"
          leftSection={<IconUpload size={16} />}
          disabled={disabled}
        >
          Choose file
        </Button>
        <input
          ref={inputRef}
          className="local-cert-file-input"
          type="file"
          aria-label="Choose certificate or secret file"
          disabled={disabled}
          onChange={(event: ChangeEvent<HTMLInputElement>) => void readFile(event.target.files?.[0])}
        />
      </div>
      {fileName && !error && <Group gap="xs"><Text size="sm" c="dimmed">Selected:</Text><Text size="sm" fw={600}>{fileName}</Text></Group>}
      {error && <Alert color="red" title="Unable to use file">{error}</Alert>}
    </Stack>
  );
}
