import { ActionIcon, Anchor, Table, Text, Tooltip } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { stagingCertificateDetailRoute } from '../../app/routes';
import { StagingCertificateValidityIndicators } from './StagingCertificateValidityIndicators';
import type { StagingCertificateStatusByKey } from './stagingCertificateTypes';

interface StagingCertificatesTableProps {
  keys: string[];
  statuses: StagingCertificateStatusByKey;
  onRetryStatus: (key: string) => void;
}

export function StagingCertificatesTable({
  keys,
  statuses,
  onRetryStatus,
}: StagingCertificatesTableProps) {
  return (
    <Table.ScrollContainer minWidth={620}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th className="staging-certificates-status-column">Is Valid</Table.Th>
            <Table.Th aria-label="Open detail" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {keys.map((key) => (
            <Table.Tr key={key}>
              <Table.Td>
                <Anchor component={Link} to={stagingCertificateDetailRoute(key)} size="sm" fw={600}>
                  {key}
                </Anchor>
              </Table.Td>
              <Table.Td className="staging-certificates-status-column">
                <StagingCertificateValidityIndicators
                  state={statuses[key]}
                  onRetry={() => onRetryStatus(key)}
                />
              </Table.Td>
              <Table.Td>
                <Tooltip label={`Open ${key}`}>
                  <ActionIcon
                    component={Link}
                    to={stagingCertificateDetailRoute(key)}
                    variant="subtle"
                    color="blue"
                    aria-label={`Open ${key}`}
                  >
                    <IconArrowRight size={18} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Text size="xs" c="dimmed" mt="xs">
        Status loads only for rows on the current page.
      </Text>
    </Table.ScrollContainer>
  );
}
