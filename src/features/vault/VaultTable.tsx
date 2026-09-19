import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconChevronRight, IconFolder } from '@tabler/icons-react';
import type { VaultTreeNode } from './catalogTypes';
import { formatIssueDetails } from './issueSummary';

interface VaultTableProps {
  folders: VaultTreeNode[];
  onOpen: (path: string) => void;
}

const severityColor: Record<string, string> = {
  CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue',
};

export function VaultTable({ folders, onOpen }: VaultTableProps) {
  return (
    <Table.ScrollContainer minWidth={680}>
      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Folder</Table.Th>
            <Table.Th>Stores</Table.Th>
            <Table.Th>Key contents</Table.Th>
            <Table.Th>Issues</Table.Th>
            <Table.Th aria-label="Actions" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {folders.map((folder) => (
            <Table.Tr key={folder.fullPath}>
              <Table.Td>
                <Group gap="sm" wrap="nowrap">
                  <IconFolder size={19} color="var(--mantine-color-teal-7)" fill="var(--mantine-color-teal-1)" />
                  <div>
                    <Text component="button" className="folder-link" fw={600} onClick={() => onOpen(folder.fullPath)}>
                      {folder.name}
                    </Text>
                    <Text size="xs" c="dimmed">{folder.fullPath}</Text>
                  </div>
                </Group>
              </Table.Td>
              <Table.Td><Text size="sm" fw={600}>{folder.aggregate.itemCount}</Text></Table.Td>
              <Table.Td>
                <Group gap={5}>
                  {Object.entries(folder.aggregate.keyCountByType).map(([type, count]) => (
                    <Tooltip key={type} label={type.replaceAll('_', ' ').toLocaleLowerCase()}>
                      <Badge variant="light" color="teal" size="sm">{count} {type === 'TRUSTED_CERTIFICATE' ? 'trusted' : type.replaceAll('_', ' ').toLocaleLowerCase()}</Badge>
                    </Tooltip>
                  ))}
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap={5}>
                  {Object.keys(folder.aggregate.issueSummaryBySeverity).length === 0 && <Text size="sm" c="green.7">Clear</Text>}
                  {Object.entries(folder.aggregate.issueSummaryBySeverity).map(([severity, summary]) => (
                    <Tooltip key={severity} label={formatIssueDetails(summary.issueCountsByType)}>
                      <Badge color={severityColor[severity] ?? 'gray'} variant="dot" size="sm" tabIndex={0}>
                        {summary.count} {severity.toLocaleLowerCase()}
                      </Badge>
                    </Tooltip>
                  ))}
                </Group>
              </Table.Td>
              <Table.Td>
                <Tooltip label={`Open ${folder.name}`}>
                  <ActionIcon variant="subtle" color="teal" aria-label={`Open ${folder.name}`} onClick={() => onOpen(folder.fullPath)}>
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
