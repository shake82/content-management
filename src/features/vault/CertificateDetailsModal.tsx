import { Code, Modal, Table } from '@mantine/core';
import { parseKeystoreDate } from './certificateStatus';
import type { KeystoreCertificate } from './detailTypes';
import { formatKeystoreDate } from './keystoreDisplay';

interface CertificateDetailsModalProps {
  certificate: KeystoreCertificate | null;
  onClose: () => void;
}

const expiredDateStyle = { color: 'var(--mantine-color-red-6)' };

function isExpiredDate(value: string | null) {
  const date = parseKeystoreDate(value);

  return Boolean(date && date.getTime() < Date.now());
}

export function CertificateDetailsModal({ certificate, onClose }: CertificateDetailsModalProps) {
  const showRevocationDate = Boolean(certificate?.revocationDate?.trim());

  return (
    <Modal
      opened={Boolean(certificate)}
      onClose={onClose}
      title="Certificate Detail"
      size="lg"
      closeButtonProps={{ 'aria-label': 'Close certificate details' }}
    >
      {certificate && (
        <Table verticalSpacing="sm">
          <Table.Tbody>
            <Table.Tr><Table.Th>Subject</Table.Th><Table.Td>{certificate.subject}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Issuer</Table.Th><Table.Td>{certificate.issuer}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Serial Number</Table.Th><Table.Td><Code>{certificate.hexSerialNumber}</Code></Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Start Date</Table.Th><Table.Td>{formatKeystoreDate(certificate.startDate)}</Table.Td></Table.Tr>
            <Table.Tr>
              <Table.Th>End Date</Table.Th>
              <Table.Td style={isExpiredDate(certificate.endDate) ? expiredDateStyle : undefined}>
                {formatKeystoreDate(certificate.endDate)}
              </Table.Td>
            </Table.Tr>
            {showRevocationDate && (
              <Table.Tr>
                <Table.Th>Revocation Date</Table.Th>
                <Table.Td style={isExpiredDate(certificate.revocationDate) ? expiredDateStyle : undefined}>
                  {formatKeystoreDate(certificate.revocationDate)}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}
