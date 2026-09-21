import { ActionIcon, Badge, Box, Collapse, Divider, Group, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { StatusView } from '../../components/StatusView';
import { CertificateTree } from './CertificateTree';
import type { KeystoreCertificate, KeystoreKeyEntry } from './detailTypes';
import { EntryValidity } from './EntryValidity';
import { useKeystoreComparison } from './useKeystoreComparison';
import type { KeystoreLocation } from './keystoreLocation';

function displayComparisonResult(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLocaleLowerCase()
    .replace(/^./, (character) => character.toLocaleUpperCase());
}

function ComparisonTree({
  entry,
  label,
  onSelectCertificate,
}: {
  entry: KeystoreKeyEntry | null;
  label: string;
  onSelectCertificate: (certificate: KeystoreCertificate) => void;
}) {
  return (
    <Box className="comparison-tree-panel">
      <Text size="sm" fw={600} mb="xs">{label}</Text>
      {entry
        ? <CertificateTree entry={entry} onSelect={onSelectCertificate} />
        : <Text size="sm" c="dimmed" py="md">Entry does not exist in this version.</Text>}
    </Box>
  );
}

export function KeystoreComparisonTable({
  location,
  currentVersion,
  selectedVersion,
  onSelectCertificate,
}: {
  location: Partial<KeystoreLocation>;
  currentVersion: number;
  selectedVersion: number;
  onSelectCertificate: (certificate: KeystoreCertificate) => void;
}) {
  const comparison = useKeystoreComparison(location, selectedVersion);
  const [expandedAliases, setExpandedAliases] = useState<Set<string>>(() => new Set());

  const toggleExpanded = (alias: string) => {
    setExpandedAliases((current) => {
      const next = new Set(current);
      if (next.has(alias)) next.delete(alias);
      else next.add(alias);
      return next;
    });
  };

  return (
    <section aria-labelledby="keystore-comparison-heading">
      <Group justify="space-between" mb="xs">
        <div>
          <Title id="keystore-comparison-heading" order={2} size="h4">Version comparison</Title>
          <Text size="sm" c="dimmed">Current version {currentVersion} compared with version {selectedVersion}</Text>
        </div>
      </Group>
      <Divider />

      {(comparison.status === 'idle' || comparison.status === 'loading') && (
        <StatusView kind="loading" message="Comparing keystore versions..." />
      )}
      {comparison.status === 'error' && (
        <StatusView kind="error" message={comparison.error?.message} onRetry={comparison.refetch} />
      )}
      {comparison.status === 'success' && comparison.data && (
        <Table.ScrollContainer minWidth={900}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th aria-label="Expand row" />
                <Table.Th>Type</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Comparison Result</Table.Th>
                <Table.Th>Is Current Valid</Table.Th>
                <Table.Th>Is Version {selectedVersion} Valid</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {comparison.data.keyEntries.map((comparisonEntry) => {
                const expanded = expandedAliases.has(comparisonEntry.alias);
                const displayEntry = comparisonEntry.sourceKeyEntry ?? comparisonEntry.targetKeyEntry;

                return (
                  <Fragment key={comparisonEntry.alias}>
                    <Table.Tr>
                      <Table.Td>
                        <Tooltip label={expanded ? `Collapse ${comparisonEntry.alias}` : `Expand ${comparisonEntry.alias}`}>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            aria-label={expanded ? `Collapse ${comparisonEntry.alias}` : `Expand ${comparisonEntry.alias}`}
                            aria-expanded={expanded}
                            onClick={() => toggleExpanded(comparisonEntry.alias)}
                          >
                            {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                      <Table.Td><Badge variant="outline" color="gray">{displayEntry?.entryType ?? 'N/A'}</Badge></Table.Td>
                      <Table.Td><Text size="sm" fw={600}>{comparisonEntry.alias}</Text></Table.Td>
                      <Table.Td><Badge variant="light" color="blue">{displayComparisonResult(comparisonEntry.comparisonResult)}</Badge></Table.Td>
                      <Table.Td><EntryValidity entry={comparisonEntry.sourceKeyEntry} /></Table.Td>
                      <Table.Td><EntryValidity entry={comparisonEntry.targetKeyEntry} /></Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td colSpan={6} className="keystore-chain-cell">
                        <Collapse expanded={expanded} keepMounted={false}>
                          <Box className="comparison-trees" py="md">
                            <ComparisonTree
                              entry={comparisonEntry.sourceKeyEntry}
                              label={`Current version ${currentVersion}`}
                              onSelectCertificate={onSelectCertificate}
                            />
                            <ComparisonTree
                              entry={comparisonEntry.targetKeyEntry}
                              label={`Version ${selectedVersion}`}
                              onSelectCertificate={onSelectCertificate}
                            />
                          </Box>
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  </Fragment>
                );
              })}
              {comparison.data.keyEntries.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="lg">No comparison results found.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </section>
  );
}
