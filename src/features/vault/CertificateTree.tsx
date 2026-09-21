import { Badge, Box, Button, Group, Text } from '@mantine/core';
import { IconCertificate } from '@tabler/icons-react';
import { useMemo } from 'react';
import { StatusView } from '../../components/StatusView';
import { buildCertificateChain, getCertificateTitle, type CertificateChainNode } from './certificateChain';
import { getCertificateStatuses, type CertificateStatus } from './certificateStatus';
import type { KeystoreCertificate, KeystoreKeyEntry } from './detailTypes';

const certificateStatusColor: Record<CertificateStatus, string> = {
  Expired: 'red',
  Expiring: 'orange',
  'Not Started': 'yellow',
  Revoked: 'red',
};

function CertificateNode({ node, onSelect }: { node: CertificateChainNode; onSelect?: (certificate: KeystoreCertificate) => void }) {
  const title = getCertificateTitle(node.certificate);
  const statuses = getCertificateStatuses(node.certificate);

  return (
    <li>
      <Group gap="xs" wrap="nowrap" align="flex-start" className="certificate-tree-node">
        <IconCertificate size={18} color="var(--mantine-color-blue-7)" />
        <div className="certificate-tree-content">
          <Group gap="xs" wrap="wrap">
            {onSelect ? (
              <Button variant="subtle" size="compact-sm" px={4} onClick={() => onSelect(node.certificate)}>
                {title}
              </Button>
            ) : <Text size="sm" fw={600}>{title}</Text>}
            {statuses.map((status) => (
              <Badge key={status} size="xs" color={certificateStatusColor[status]} variant="light">
                {status}
              </Badge>
            ))}
          </Group>
          <Text size="xs" c="dimmed">{node.certificate.subject}</Text>
        </div>
      </Group>
      {node.children.length > 0 && (
        <Box component="ul" className="certificate-tree">
          {node.children.map((child) => (
            <CertificateNode key={`${child.certificate.subject}-${child.certificate.hexSerialNumber}`} node={child} onSelect={onSelect} />
          ))}
        </Box>
      )}
    </li>
  );
}

export function CertificateTree({ entry, onSelect }: { entry: KeystoreKeyEntry; onSelect?: (certificate: KeystoreCertificate) => void }) {
  const certificates = entry.certificates ?? [];
  const roots = useMemo(() => buildCertificateChain(certificates), [certificates]);

  if (certificates.length === 0) {
    return <StatusView kind="empty" message="No certificates are attached to this entry." />;
  }

  return (
    <Box component="ul" className="certificate-tree certificate-tree-root">
      {roots.map((node) => (
        <CertificateNode key={`${node.certificate.subject}-${node.certificate.hexSerialNumber}`} node={node} onSelect={onSelect} />
      ))}
    </Box>
  );
}
