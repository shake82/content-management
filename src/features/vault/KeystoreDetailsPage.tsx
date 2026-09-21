import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Code,
  Collapse,
  Divider,
  Group,
  Modal,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconInfoCircle } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { routes, vaultPathRoute } from '../../app/routes';
import { StatusView } from '../../components/StatusView';
import { CertificateTree } from './CertificateTree';
import { getCertificateTitle } from './certificateChain';
import { parseKeystoreDate } from './certificateStatus';
import type { KeystoreCertificate, KeystoreKeyEntry } from './detailTypes';
import { EntryValidity } from './EntryValidity';
import { KeystoreComparisonTable } from './KeystoreComparisonTable';
import { useKeystoreDetails } from './useKeystoreDetails';
import { useVaultCatalog } from './useVaultCatalog';

function formatDate(value: string | null) {
  if (!value) return 'None';

  const date = parseKeystoreDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function CertificateChain({ entry, onSelect }: { entry: KeystoreKeyEntry; onSelect: (certificate: KeystoreCertificate) => void }) {
  return (
    <Box py="sm">
      <Text size="sm" fw={600} mb="xs">Certificate chain</Text>
      <CertificateTree entry={entry} onSelect={onSelect} />
    </Box>
  );
}

function CertificateDetailsModal({ certificate, onClose }: { certificate: KeystoreCertificate | null; onClose: () => void }) {
  const fingerprint = certificate?.fingerprint ?? certificate?.fingerpring ?? 'None';

  return (
    <Modal opened={Boolean(certificate)} onClose={onClose} title={certificate ? getCertificateTitle(certificate) : 'Certificate details'} size="lg">
      {certificate && (
        <Table verticalSpacing="sm">
          <Table.Tbody>
            <Table.Tr><Table.Th>Subject</Table.Th><Table.Td>{certificate.subject}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Issuer</Table.Th><Table.Td>{certificate.issuer}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Version</Table.Th><Table.Td>{certificate.version}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Serial number</Table.Th><Table.Td><Code>{certificate.hexSerialNumber}</Code></Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Start date</Table.Th><Table.Td>{formatDate(certificate.startDate)}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>End date</Table.Th><Table.Td>{formatDate(certificate.endDate)}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Revocation date</Table.Th><Table.Td>{formatDate(certificate.revocationDate)}</Table.Td></Table.Tr>
            <Table.Tr><Table.Th>Fingerprint</Table.Th><Table.Td><Code>{fingerprint}</Code></Table.Td></Table.Tr>
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}

export function KeystoreDetailsPage() {
  const { catalogId } = useParams();
  const parsedCatalogId = catalogId ? Number(catalogId) : undefined;
  const catalog = useVaultCatalog();
  const details = useKeystoreDetails(parsedCatalogId);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [entryFilter, setEntryFilter] = useState<'all' | 'issues' | 'high'>('all');
  const [expandedAliases, setExpandedAliases] = useState<Set<string>>(() => new Set());
  const [selectedCertificate, setSelectedCertificate] = useState<KeystoreCertificate | null>(null);
  const item = catalog.data?.find((entry) => entry.catalogId === parsedCatalogId);

  if (catalog.status === 'idle' || catalog.status === 'loading' || details.status === 'idle' || details.status === 'loading') {
    return <StatusView kind="loading" message="Loading keystore..." />;
  }
  if (catalog.status === 'error') return <StatusView kind="error" message={catalog.error?.message} onRetry={catalog.refetch} />;
  if (details.status === 'error') return <StatusView kind="error" message={details.error?.message} onRetry={details.refetch} />;
  if (!details.data) return <StatusView kind="empty" message="No keystore details found." />;

  const currentVersion = details.data.version;
  const pathSegments = item ? [item.secretEngine, ...item.path.split('/').filter(Boolean)] : [];
  const activeVersion = selectedVersion ?? currentVersion;
  const versionOptions = [...details.data.versions]
    .sort((left, right) => right.version - left.version)
    .map((version) => ({
      value: String(version.version),
      label: version.version === currentVersion
        ? `Version ${version.version} (Current)`
        : `Version ${version.version} - ${formatDate(version.createdDate)}`,
    }));
  const filteredEntries = details.data.keyEntries.filter((entry) => {
    if (entryFilter === 'issues') return entry.issues.length > 0;
    if (entryFilter === 'high') return entry.issues.some((issue) => issue.severity.toUpperCase() === 'HIGH');
    return true;
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
    <Box mx="auto">
      <Stack gap="md">
        <Breadcrumbs component="nav" separator="/" aria-label="Keystore path">
          <Anchor component={Link} to={routes.vault}>Vault View</Anchor>
          {pathSegments.map((segment, index) => {
            const ancestorPath = pathSegments.slice(0, index + 1).join('/');
            return (
              <Anchor component={Link} to={vaultPathRoute(ancestorPath)} key={ancestorPath}>
                {segment}
              </Anchor>
            );
          })}
          <Text size="sm" fw={600} c="var(--mantine-color-text)" aria-current="page">
            {item?.property ?? 'Keystore not found'}
          </Text>
        </Breadcrumbs>
        <Group justify="space-between" align="flex-end" className="page-heading">
          <div>
            <Text className="page-eyebrow">Key store record</Text>
            <Title order={1} size="h2">Keystore Details</Title>
          </div>
          <Select
            className="keystore-version-select"
            label="Compare version"
            aria-label="Compare version"
            value={String(activeVersion)}
            data={versionOptions}
            allowDeselect={false}
            onChange={(value) => setSelectedVersion(value ? Number(value) : currentVersion)}
          />
        </Group>

        {activeVersion === currentVersion ? <section aria-labelledby="keystore-entry-heading">
          <Group justify="space-between" align="flex-end" mb="xs">
            <div>
              <Title id="keystore-entry-heading" order={2} size="h4">Key entries</Title>
              <Text size="sm" c="dimmed">Version {details.data.version}</Text>
            </div>
            <Stack gap={4} align="flex-end">
              <SegmentedControl
                aria-label="Filter key entries"
                value={entryFilter}
                onChange={(value) => setEntryFilter(value as 'all' | 'issues' | 'high')}
                data={[
                  { label: 'Show all', value: 'all' },
                  { label: 'With issues', value: 'issues' },
                  { label: 'High severity', value: 'high' },
                ]}
              />
              <Text size="sm" c="dimmed">{filteredEntries.length} of {details.data.keyEntries.length} entries</Text>
            </Stack>
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
                          <Group gap={6} wrap="nowrap">
                            <EntryValidity entry={entry} />
                            {entry.issues.length > 0 && <IconInfoCircle size={16} color="var(--mantine-color-orange-7)" aria-hidden />}
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm" fw={600}>{entry.alias}</Text></Table.Td>
                        <Table.Td><Text size="sm">{formatDate(entry.expirationDate)}</Text></Table.Td>
                        <Table.Td><Text size="sm">{formatDate(entry.lastModifiedDate)}</Text></Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td colSpan={6} className="keystore-chain-cell">
                          <Collapse expanded={expanded} keepMounted={false}>
                            <CertificateChain entry={entry} onSelect={setSelectedCertificate} />
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
        </section> : (
          <KeystoreComparisonTable
            catalogId={parsedCatalogId}
            currentVersion={currentVersion}
            selectedVersion={activeVersion}
            onSelectCertificate={setSelectedCertificate}
          />
        )}
      </Stack>
      <CertificateDetailsModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
    </Box>
  );
}
