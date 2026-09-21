import { Anchor, Table, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { keystoreDetailsRoute } from '../../app/routes';
import type { CertificateVaultReference } from './certificateCatalogTypes';

export function CertificateReferencesTable({ references }: { references: CertificateVaultReference[] }) {
  if (references.length === 0) {
    return <Text size="sm" c="dimmed">This certificate is not referenced by a keystore.</Text>;
  }

  return (
    <div className="certificate-view-references" tabIndex={0} aria-label="Certificate references">
      <Table stickyHeader verticalSpacing="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Path</Table.Th>
            <Table.Th>Type</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {references.map((reference) => (
            <Table.Tr key={`${reference.catalogId}-${reference.secretVersion}-${reference.property}`}>
              <Table.Td>
                <Anchor component={Link} to={keystoreDetailsRoute({
                  engine: reference.secretEngine,
                  path: reference.path,
                  prop: reference.property,
                })} size="sm">
                  {reference.path}
                </Anchor>
              </Table.Td>
              <Table.Td><Text size="sm">{reference.type}</Text></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
