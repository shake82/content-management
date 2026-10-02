import { Alert, Modal } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stagingCertificateDetailRoute } from '../../app/routes';
import { CertificateRequestFields } from '../tools/certificateRequestGenerator/CertificateRequestFields';
import { useCreateStagingCertificate } from './useCreateStagingCertificate';

interface NewStagingCertificateModalProps {
  opened: boolean;
  onClose: () => void;
}

export function NewStagingCertificateModal({ opened, onClose }: NewStagingCertificateModalProps) {
  const navigate = useNavigate();
  const creator = useCreateStagingCertificate();

  useEffect(() => {
    if (creator.status !== 'success' || !creator.data) return;
    const detailRoute = stagingCertificateDetailRoute(creator.data.path);
    creator.reset();
    onClose();
    navigate(detailRoute);
  }, [creator, navigate, onClose]);

  const close = () => {
    if (creator.status === 'loading') return;
    creator.reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={close} title="New staging certificate" size="lg" centered>
      {creator.status === 'error' && (
        <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to create staging certificate" mb="md">
          {creator.error?.message ?? 'An unexpected error occurred.'}
        </Alert>
      )}
      <CertificateRequestFields
        disabled={creator.status === 'loading'}
        loading={creator.status === 'loading'}
        onSubmit={(payload) => {
          void creator.submit(payload).catch(() => undefined);
        }}
      />
    </Modal>
  );
}
