import { Alert, Button, Group, Modal, Stack } from '@mantine/core';
import { IconAlertTriangle, IconUpload } from '@tabler/icons-react';
import { type FormEvent, useState } from 'react';
import { PemTextareaWithActions } from '../../common/PemTextareaWithActions';
import { useCompleteCertificateRequest } from './useCompleteCertificateRequest';

interface CompleteCertificateRequestModalProps {
  opened: boolean;
  path: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompleteCertificateRequestModal({
  opened,
  path,
  onClose,
  onSuccess,
}: CompleteCertificateRequestModalProps) {
  const completer = useCompleteCertificateRequest(path);
  const [cert, setCert] = useState('');
  const [parentChain, setParentChain] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const loading = completer.status === 'loading';

  const close = () => {
    if (loading) return;
    completer.reset();
    setValidationError(undefined);
    onClose();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextCert = cert.trim();
    const nextParentChain = parentChain.trim();
    if (!nextCert) {
      setValidationError('New Certificate is required.');
      return;
    }

    setValidationError(undefined);
    try {
      await completer.submit({ cert: nextCert, parentChain: nextParentChain });
      setCert('');
      setParentChain('');
      completer.reset();
      onClose();
      onSuccess();
    } catch {
      // The hook stores the error so the modal can keep the user-entered PEM content visible.
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="Complete certificate request" size="xl" centered>
      <form onSubmit={(event) => void submit(event)}>
        <Stack gap="md">
          {validationError && <Alert color="red" title="Missing certificate">{validationError}</Alert>}
          {completer.status === 'error' && (
            <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to upload certificate">
              {completer.error?.message ?? 'An unexpected error occurred.'}
            </Alert>
          )}
          <PemTextareaWithActions
            label="New Certificate"
            required
            value={cert}
            onChange={setCert}
            disabled={loading}
          />
          <PemTextareaWithActions
            label="Parent Chain"
            value={parentChain}
            onChange={setParentChain}
            disabled={loading}
          />
          <Group justify="flex-end">
            <Button type="button" variant="subtle" onClick={close} disabled={loading}>Cancel</Button>
            <Button type="submit" leftSection={<IconUpload size={16} />} loading={loading}>
              Upload Certificate
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
