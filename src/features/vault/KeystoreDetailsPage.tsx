import {
  Anchor,
  Box,
  Breadcrumbs,
  Group,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { routes, vaultPathRoute } from '../../app/routes';
import { StatusView } from '../../components/StatusView';
import { CertificateDetailsModal } from './CertificateDetailsModal';
import type { KeystoreCertificate } from './detailTypes';
import { KeystoreEntriesTable } from './KeystoreEntriesTable';
import { KeystoreComparisonTable } from './KeystoreComparisonTable';
import { formatKeystoreDate } from './keystoreDisplay';
import { useKeystoreDetails } from './useKeystoreDetails';
import { useVaultCatalog } from './useVaultCatalog';

export function KeystoreDetailsPage() {
  const { catalogId } = useParams();
  const parsedCatalogId = catalogId ? Number(catalogId) : undefined;
  const catalog = useVaultCatalog();
  const details = useKeystoreDetails(parsedCatalogId);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
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
        : `Version ${version.version} - ${formatKeystoreDate(version.createdDate)}`,
    }));

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

        {activeVersion === currentVersion ? (
          <KeystoreEntriesTable
            entries={details.data.keyEntries}
            subtitle={`Version ${details.data.version}`}
          />
        ) : (
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
