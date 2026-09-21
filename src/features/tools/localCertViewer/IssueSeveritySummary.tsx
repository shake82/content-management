import { Badge, Group, Stack, Text } from '@mantine/core';
import { formatIssueDetails } from '../../vault/issueSummary';

const severityColor: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'blue',
};

export function IssueSeveritySummary({ summary }: { summary: Record<string, Record<string, number>> }) {
  const severities = Object.entries(summary).filter(([, counts]) => Object.keys(counts).length > 0);

  if (severities.length === 0) return <Text size="sm" c="dimmed">No parser issues found.</Text>;

  return (
    <Stack gap="xs">
      {severities.map(([severity, counts]) => (
        <Group key={severity} gap="sm" align="flex-start">
          <Badge color={severityColor[severity.toUpperCase()] ?? 'gray'} variant="light">{severity}</Badge>
          <Text size="sm">{formatIssueDetails(counts)}</Text>
        </Group>
      ))}
    </Stack>
  );
}
