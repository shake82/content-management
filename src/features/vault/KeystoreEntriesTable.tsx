import {
  ActionIcon,
  Badge,
  Box,
  Collapse,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { CertificateDetailsModal } from './CertificateDetailsModal';
import { CertificateTree } from './CertificateTree';
import type { KeystoreCertificate, KeystoreKeyEntry } from './detailTypes';
import { EntryValidity } from './EntryValidity';
import { formatKeystoreDate } from './keystoreDisplay';
import { matchesKeystoreEntrySearch } from './keystoreEntrySearch';

interface KeystoreEntriesTableProps {
  entries: KeystoreKeyEntry[];
  title?: string;
  subtitle?: string;
  enableFilters?: boolean;
}

type EntryFilter = 'all' | 'issues' | 'high';

export function KeystoreEntriesTable({
  entries,
  title = 'Key entries',
  subtitle,
  enableFilters = true,
}: KeystoreEntriesTableProps) {
  const [entryFilter, setEntryFilter] = useState<EntryFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedAliases, setExpandedAliases] = useState<Set<string>>(() => new Set());
  const [selectedCertificate, setSelectedCertificate] = useState<KeystoreCertificate | null>(null);
  const filteredEntries = entries.filter((entry) => {
    const matchesSeverity = entryFilter === 'all'
      || (entryFilter === 'issues' && entry.issues.length > 0)
      || (entryFilter === 'high' && entry.issues.some((issue) => issue.severity.toUpperCase() === 'HIGH'));
    return matchesSeverity && matchesKeystoreEntrySearch(entry, search);
  });

  const toggleExpanded = (alias: string) => {
    setExpandedAliases((current) => {
      const next = new Set(current);
      if (next.has(alias)) next.delete(alias);
      else next.add(alias);
      return next;
    });
  };

  return (
    <section aria-labelledby="keystore-entry-heading">
      <Group justify="space-between" align="flex-end" mb="xs">
        <div>
          <Title id="keystore-entry-heading" order={2} size="h4">{title}</Title>
          {subtitle && <Text size="sm" c="dimmed">{subtitle}</Text>}
        </div>
        {enableFilters && (
          <Stack gap={4} align="flex-end">
            <TextInput
              aria-label="Search key entries"
              placeholder="Search name, serial, or subject"
              leftSection={<IconSearch size={17} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              className="keystore-entry-search"
            />
            <SegmentedControl
              aria-label="Filter key entries"
              value={entryFilter}
              onChange={(value) => setEntryFilter(value as EntryFilter)}
              data={[
                { label: 'Show all', value: 'all' },
                { label: 'With issues', value: 'issues' },
                { label: 'High severity', value: 'high' },
              ]}
            />
            <Text size="sm" c="dimmed">{filteredEntries.length} of {entries.length} entries</Text>
          </Stack>
        )}
      </Group>
      <Divider />
      <Table.ScrollContainer minWidth={780}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th aria-label="Expand row" />
              <Table.Th>Type</Table.Th>
              <Table.Th>Is Valid</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Expiration</Table.Th>
              <Table.Th>Last Modified</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEntries.map((entry) => {
              const expanded = expandedAliases.has(entry.alias);
              return (
                <Fragment key={entry.alias}>
                  <Table.Tr>
                    <Table.Td>
                      <Tooltip label={expanded ? `Collapse ${entry.alias}` : `Expand ${entry.alias}`}>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          aria-label={expanded ? `Collapse ${entry.alias}` : `Expand ${entry.alias}`}
                          aria-expanded={expanded}
                          onClick={() => toggleExpanded(entry.alias)}
                        >
                          {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td><Badge variant="outline" color="gray">{entry.entryType}</Badge></Table.Td>
                    <Table.Td>
                      <EntryValidity entry={entry} />
                    </Table.Td>
                    <Table.Td><Text size="sm" fw={600}>{entry.alias}</Text></Table.Td>
                    <Table.Td><Text size="sm">{formatKeystoreDate(entry.expirationDate)}</Text></Table.Td>
                    <Table.Td><Text size="sm">{formatKeystoreDate(entry.lastModifiedDate)}</Text></Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td colSpan={6} className="keystore-chain-cell">
                      <Collapse expanded={expanded} keepMounted={false}>
                        <Box py="sm">
                          <Text size="sm" fw={600} mb="xs">Certificate chain</Text>
                          <CertificateTree entry={entry} onSelect={setSelectedCertificate} />
                        </Box>
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                </Fragment>
              );
            })}
            {filteredEntries.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="lg">No key entries match this filter.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <CertificateDetailsModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
    </section>
  );
}
