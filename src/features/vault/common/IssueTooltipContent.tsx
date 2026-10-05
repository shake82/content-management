import { Stack, Text } from '@mantine/core';

interface IssueTooltipItem {
  severity: string;
  type: string;
  count?: number;
}

function toPascalCase(value: string) {
  return value
    .toLocaleLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0]!.toLocaleUpperCase() + word.slice(1))
    .join('');
}

export function IssueTooltipContent({ issues }: { issues: IssueTooltipItem[] }) {
  return (
    <Stack gap={2}>
      {issues.map((issue, index) => (
        <Text size="xs" key={`${issue.severity}-${issue.type}-${index}`}>
          {issue.severity.toUpperCase()}: {toPascalCase(issue.type)}
          {issue.count && issue.count > 1 ? ` (${issue.count})` : ''}
        </Text>
      ))}
    </Stack>
  );
}

export function issueSummaryTooltipItems(severity: string, issueCounts: Record<string, number>) {
  return Object.entries(issueCounts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([type, count]) => ({ severity, type, count }));
}
