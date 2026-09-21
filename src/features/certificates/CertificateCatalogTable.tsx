import {
  ActionIcon,
  Badge,
  Box,
  Collapse,
  Group,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { CertificateTree } from '../vault/CertificateTree';
import type { KeystoreKeyEntry } from '../vault/detailTypes';
import type { CertificateCatalogItem } from './certificateCatalogTypes';
import { formatCertificateDate, getCertificateCatalogValidity } from './certificateCatalogStatus';
import { CertificateReferencesTable } from './CertificateReferencesTable';

function entryForTree(item: CertificateCatalogItem): KeystoreKeyEntry {
  return {
    alias: item.shortName,
    entryType: item.entryType,
    certificates: item.certChainDetails.certificates,
    expirationDate: item.expirationDate,
    issues: item.certChainDetails.issues ?? [],
    lastModifiedDate: null,
  };
}

function ValidityBadge({ item }: { item: CertificateCatalogItem }) {
  const validity = getCertificateCatalogValidity(item);
  const badge = (
    <Badge
      color={validity.severity === 'error' ? 'red' : validity.severity === 'warning' ? 'yellow' : 'green'}
      variant={validity.isValid ? 'light' : 'dot'}
      tabIndex={validity.issues.length > 0 ? 0 : undefined}
    >
      {validity.isValid ? 'Yes' : 'No'}
    </Badge>
  );

  if (validity.issues.length === 0) return badge;
  return <Tooltip label={validity.issues.join('\n')} multiline>{badge}</Tooltip>;
}

export function CertificateCatalogTable({ items }: { items: CertificateCatalogItem[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Table.ScrollContainer minWidth={680}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th aria-label="Expand row" />
            <Table.Th>Type</Table.Th>
            <Table.Th>Is Valid</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Expiration</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => {
            const expanded = expandedIds.has(item.id);
            return (
              <Fragment key={item.id}>
                <Table.Tr>
                  <Table.Td>
                    <Tooltip label={expanded ? `Collapse ${item.shortName}` : `Expand ${item.shortName}`}>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        aria-label={expanded ? `Collapse ${item.shortName}` : `Expand ${item.shortName}`}
                        aria-expanded={expanded}
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td><Badge variant="outline" color="gray">{item.entryType}</Badge></Table.Td>
                  <Table.Td><ValidityBadge item={item} /></Table.Td>
                  <Table.Td><Text size="sm" fw={600}>{item.shortName}</Text></Table.Td>
                  <Table.Td><Text size="sm">{formatCertificateDate(item.expirationDate)}</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td colSpan={5} className="certificate-view-expanded-cell">
                    <Collapse expanded={expanded} keepMounted={false}>
                      <div className="certificate-view-expanded">
                        <Box className="certificate-view-expanded-panel">
                          <Title order={3} size="h5" mb="xs">Certificate chain</Title>
                          <CertificateTree entry={entryForTree(item)} />
                        </Box>
                        <Box className="certificate-view-expanded-panel">
                          <Group justify="space-between" mb="xs">
                            <Title order={3} size="h5">References</Title>
                            <Text size="xs" c="dimmed">{item.vaultReferences.length} total</Text>
                          </Group>
                          <CertificateReferencesTable references={item.vaultReferences} />
                        </Box>
                      </div>
                    </Collapse>
                  </Table.Td>
                </Table.Tr>
              </Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
