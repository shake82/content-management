import { ActionIcon, Badge, Code, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { keystoreDetailsRoute } from '../../app/routes';
import type { VaultCatalogItem } from './catalogTypes';
import { formatIssueDetails } from './issueSummary';

interface VaultItemsTableProps {
  items: VaultCatalogItem[];
}

export function VaultItemsTable({ items }: VaultItemsTableProps) {
  return (
    <Table.ScrollContainer minWidth={700}>
      <Table verticalSpacing="sm" striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Catalog ID</Table.Th>
            <Table.Th>Property</Table.Th>
            <Table.Th>Store type</Table.Th>
            <Table.Th>Version</Table.Th>
            <Table.Th>Key contents</Table.Th>
            <Table.Th>Issues</Table.Th>
            <Table.Th aria-label="Actions" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.catalogId}>
              <Table.Td><Text size="sm" fw={600}>#{item.catalogId}</Text></Table.Td>
              <Table.Td><Code>{item.property}</Code></Table.Td>
              <Table.Td><Badge variant="outline" color="gray">{item.type}</Badge></Table.Td>
              <Table.Td><Text size="sm">v{item.secretVersion}</Text></Table.Td>
              <Table.Td>
                <Group gap={5}>
                  {Object.entries(item.secretSummary.keyCountByType).map(([type, count]) => (
                    <Badge key={type} variant="light" color="blue">{count} {type.replaceAll('_', ' ').toLocaleLowerCase()}</Badge>
                  ))}
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap={5}>
                  {Object.keys(item.secretSummary.issueSummaryBySeverity).length === 0 && (
                    <Text size="sm" c="green.7">Clear</Text>
                  )}
                  {Object.entries(item.secretSummary.issueSummaryBySeverity).map(([severity, summary]) => (
                    <Tooltip key={severity} label={formatIssueDetails(summary.issueCountsByType)}>
                      <Badge variant="dot" color={severity === 'HIGH' ? 'orange' : severity === 'CRITICAL' ? 'red' : severity === 'MEDIUM' ? 'yellow' : 'blue'} tabIndex={0}>
                        {summary.count} {severity.toLocaleLowerCase()}
                      </Badge>
                    </Tooltip>
                  ))}
                </Group>
              </Table.Td>
              <Table.Td>
                <Tooltip label={`View keystore #${item.catalogId}`}>
                  <ActionIcon
                    component={Link}
                    to={keystoreDetailsRoute(item.catalogId)}
                    variant="subtle"
                    color="blue"
                    aria-label={`View keystore #${item.catalogId}`}
                  >
                    <IconChevronRight size={18} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
