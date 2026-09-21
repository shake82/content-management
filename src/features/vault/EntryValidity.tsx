import { Badge, Tooltip } from '@mantine/core';
import type { KeystoreKeyEntry } from './detailTypes';

const severityColor: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'blue',
};

function formatIssues(issues: KeystoreKeyEntry['issues']) {
  return issues
    .map((issue) => `${issue.severity}: ${issue.type.replaceAll('_', ' ').toLocaleLowerCase()}`)
    .join('\n');
}

export function EntryValidity({ entry }: { entry: KeystoreKeyEntry | null }) {
  if (!entry) return <Badge color="gray" variant="light">N/A</Badge>;
  if (entry.issues.length === 0) return <Badge color="green" variant="light">Yes</Badge>;

  return (
    <Tooltip label={formatIssues(entry.issues)} multiline>
      <Badge color={severityColor[entry.issues[0]?.severity.toUpperCase()] ?? 'red'} variant="dot" tabIndex={0}>
        No
      </Badge>
    </Tooltip>
  );
}
