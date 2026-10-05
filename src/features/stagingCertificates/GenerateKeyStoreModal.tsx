import { Alert, Button, Group, Modal, Stack } from '@mantine/core';
import { IconAlertTriangle, IconKey } from '@tabler/icons-react';
import { type FormEvent, useState } from 'react';
import { PemTextareaWithActions } from './PemTextareaWithActions';
import { useGenerateKeyStore } from './useGenerateKeyStore';

interface GenerateKeyStoreModalProps {
  opened: boolean;
  path: string;
  parentChainRequired: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GenerateKeyStoreModal({
  opened,
  path,
  parentChainRequired,
  onClose,
  onSuccess,
}: GenerateKeyStoreModalProps) {
  const generator = useGenerateKeyStore(path);
  const [parentChain, setParentChain] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const loading = generator.status === 'loading';

  const close = () => {
    if (loading) return;
    generator.reset();
    setValidationError(undefined);
    onClose();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextParentChain = parentChain.trim();

    if (parentChainRequired && !nextParentChain) {
      setValidationError('Parent Chain is required.');
      return;
    }

    setValidationError(undefined);
    try {
      await generator.submit({ parentChain: parentChainRequired ? nextParentChain : '' });
      setParentChain('');
      generator.reset();
      onClose();
      onSuccess();
    } catch {
      // The hook stores the error so the modal can keep user-entered PEM content visible.
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Generate keystore"
      size="xl"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={(event) => void submit(event)}>
        <Stack gap="md">
          {validationError && <Alert color="red" title="Missing parent chain">{validationError}</Alert>}
          {generator.status === 'error' && (
            <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to generate keystore">
              {generator.error?.message ?? 'An unexpected error occurred.'}
            </Alert>
          )}
          {parentChainRequired && (
            <PemTextareaWithActions
              label="Parent Chain"
              required
              value={parentChain}
              onChange={setParentChain}
              disabled={loading}
            />
          )}
          <Group justify="flex-end">
            <Button type="button" variant="subtle" onClick={close} disabled={loading}>Cancel</Button>
            <Button type="submit" leftSection={<IconKey size={16} />} loading={loading}>
              Generate
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
