import { Code, Modal, Table } from '@mantine/core';
import { getCertificateTitle } from './certificateChain';
import type { KeystoreCertificate } from './detailTypes';
import { formatKeystoreDate } from './keystoreDisplay';

interface CertificateDetailsModalProps {
  certificate: KeystoreCertificate | null;
  onClose: () => void;
}

export function CertificateDetailsModal({ certificate, onClose }: CertificateDetailsModalProps) {
  const fingerprint = certificate?.fingerprint ?? certificate?.fingerpring ?? 'None';

  return (
    <Modal
      opened={Boolean(certificate)}
      onClose={onClose}
      title={certificate ? getCertificateTitle(certificate) : 'Certificate details'}
      size="lg"
      closeButtonProps={{ 'aria-label': 'Close certificate details' }}
    >
      {certificate && (
        <Table verticalSpacing="sm">
          <Table.Tbody>
            <Table.Tr><Table.Th>Subject</Table.Th><Table.Td>{certificate.subject}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Issuer</Table.Th><Table.Td>{certificate.issuer}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Version</Table.Th><Table.Td>{certificate.version}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Serial number</Table.Th><Table.Td><Code>{certificate.hexSerialNumber}</Code></Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Start date</Table.Th><Table.Td>{formatKeystoreDate(certificate.startDate)}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>End date</Table.Th><Table.Td>{formatKeystoreDate(certificate.endDate)}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Revocation date</Table.Th><Table.Td>{formatKeystoreDate(certificate.revocationDate)}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Fingerprint</Table.Th><Table.Td><Code>{fingerprint}</Code></Table.Td></Table.Tr>
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}
