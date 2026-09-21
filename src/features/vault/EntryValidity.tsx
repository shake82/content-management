import { Badge, Stack, Text, Tooltip } from '@mantine/core';
import type { KeystoreKeyEntry } from './detailTypes';

const severityRank: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const severityColor: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'blue',
};

function highestSeverity(issues: KeystoreKeyEntry['issues']) {
  return issues.reduce((highest, issue) => {
    const severity = issue.severity.toUpperCase();
    return (severityRank[severity] ?? 0) > (severityRank[highest] ?? 0) ? severity : highest;
  }, '');
}

function toPascalCase(value: string) {
  return value
    .toLocaleLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0]!.toLocaleUpperCase() + word.slice(1))
    .join('');
}

export function EntryValidity({ entry }: { entry: KeystoreKeyEntry | null }) {
  if (!entry) return <Badge color="gray" variant="light">N/A</Badge>;
  if (entry.issues.length === 0) return <Badge color="green" variant="light">Yes</Badge>;

  const severity = highestSeverity(entry.issues);
  return (
    <Tooltip
      multiline
      label={(
        <Stack gap={2}>
          {entry.issues.map((issue, index) => (
            <Text size="xs" key={`${issue.severity}-${issue.type}-${index}`}>
              {issue.severity.toUpperCase()}: {toPascalCase(issue.type)}
            </Text>
          ))}
        </Stack>
      )}
    >
      <Badge color={severityColor[severity] ?? 'red'} variant="light" tabIndex={0} data-severity={severity}>
        {severity || 'Invalid'}
      </Badge>
    </Tooltip>
  );
}
