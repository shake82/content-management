import { Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import type { VaultAggregateSummary } from './catalogTypes';
import { IssueTooltipContent, issueSummaryTooltipItems } from './IssueTooltipContent';

interface VaultSummaryBadgesProps {
  summary: VaultAggregateSummary;
}

const severityColor: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'blue',
};

function readable(value: string) {
  return value.toLocaleLowerCase().replaceAll('_', ' ');
}

export function VaultSummaryBadges({ summary }: VaultSummaryBadgesProps) {
  const keyCounts = Object.entries(summary.keyCountByType).sort(([a], [b]) => a.localeCompare(b));
  const issues = Object.entries(summary.issueSummaryBySeverity).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="summary-strip" aria-label="Current folder summary">
      <Stack gap={6}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Contents</Text>
        <Group gap={6}>
          <Badge variant="filled" color="dark">{summary.itemCount} stores</Badge>
          {keyCounts.map(([type, count]) => (
            <Badge key={type} variant="light" color="blue">{count} {readable(type)}</Badge>
          ))}
        </Group>
      </Stack>
      <Stack gap={6}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Certificate issues</Text>
        <Group gap={6}>
          {issues.length === 0 && <Badge variant="light" color="green">No issues</Badge>}
          {issues.map(([severity, detail]) => (
            <Tooltip
              key={severity}
              multiline
              label={<IssueTooltipContent issues={issueSummaryTooltipItems(severity, detail.issueCountsByType)} />}
            >
              <Badge variant="light" color={severityColor[severity] ?? 'gray'} tabIndex={0}>
                {detail.count} {severity.toLocaleLowerCase()}
              </Badge>
            </Tooltip>
          ))}
        </Group>
      </Stack>
    </div>
  );
}
