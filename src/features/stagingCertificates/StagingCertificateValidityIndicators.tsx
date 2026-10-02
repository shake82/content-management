import { ActionIcon, Badge, Group, Loader, Tooltip } from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconKeyOff,
  IconRefresh,
  IconServerOff,
} from '@tabler/icons-react';
import {
  formatStagingCertificateIssue,
  getStagingCertificateIndicatorModel,
} from './stagingCertificateStatus';
import type {
  StagingCertificateStatusLoadState,
  StagingCertificateWorkflowIndicator,
} from './stagingCertificateTypes';

const workflowLabels: Record<StagingCertificateWorkflowIndicator, string> = {
  'missing-key-pair': 'Missing key pair',
  'missing-keystore': 'Missing keystore',
  'pending-cert-request': 'Pending certificate request',
};

const workflowColors: Record<StagingCertificateWorkflowIndicator, string> = {
  'missing-key-pair': 'red',
  'missing-keystore': 'orange',
  'pending-cert-request': 'blue',
};

function WorkflowIcon({ workflow }: { workflow: StagingCertificateWorkflowIndicator }) {
  if (workflow === 'missing-key-pair') return <IconKeyOff size={15} />;
  if (workflow === 'missing-keystore') return <IconServerOff size={15} />;
  return <IconClock size={15} />;
}

function severityColor(severity: string) {
  if (severity === 'HIGH') return 'red';
  if (severity === 'MEDIUM') return 'orange';
  if (severity === 'LOW') return 'yellow';
  if (severity === 'UNKNOWN') return 'gray';
  return 'green';
}

function severityLabel(severity: string) {
  if (severity === 'none') return 'Valid';
  if (severity === 'UNKNOWN') return 'Issue severity unknown';
  return `${severity[0]}${severity.slice(1).toLocaleLowerCase()} severity issues`;
}

export function StagingCertificateValidityIndicators({
  state,
  onRetry,
}: {
  state: StagingCertificateStatusLoadState | undefined;
  onRetry?: () => void;
}) {
  if (!state || state.status === 'idle' || state.status === 'loading') {
    return (
      <Group gap={6} wrap="nowrap" aria-label="Status loading">
        <Loader size="xs" />
        <Badge color="gray" variant="light" className="staging-certificate-status-badge">Loading</Badge>
      </Group>
    );
  }

  if (state.status === 'error') {
    return (
      <Group gap={6} wrap="nowrap">
        <Tooltip label={state.error.message}>
          <Badge color="red" variant="light" leftSection={<IconAlertTriangle size={13} />} className="staging-certificate-status-badge">
            Error
          </Badge>
        </Tooltip>
        {onRetry && (
          <Tooltip label="Retry status">
            <ActionIcon aria-label="Retry status" size="sm" variant="subtle" color="red" onClick={onRetry}>
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    );
  }

  const model = getStagingCertificateIndicatorModel(state.data);
  const issueLabels = model.validity.issues.map(formatStagingCertificateIssue);
  const validityBadge = (
    <Badge
      color={severityColor(model.validity.severity)}
      variant={model.validity.severity === 'none' ? 'light' : 'dot'}
      leftSection={model.validity.severity === 'none' ? <IconCircleCheck size={13} /> : <IconAlertCircle size={13} />}
      tabIndex={issueLabels.length > 0 ? 0 : undefined}
      aria-label={severityLabel(model.validity.severity)}
      className="staging-certificate-status-badge"
    >
      {model.validity.severity === 'none' ? 'Valid' : model.validity.severity}
    </Badge>
  );

  return (
    <Group gap={6} wrap="nowrap">
      {issueLabels.length > 0 ? (
        <Tooltip label={issueLabels.join('\n')} multiline>{validityBadge}</Tooltip>
      ) : validityBadge}
      {model.workflow.map((workflow) => (
        <Tooltip label={workflowLabels[workflow]} key={workflow}>
          <Badge
            color={workflowColors[workflow]}
            variant="light"
            leftSection={<WorkflowIcon workflow={workflow} />}
            aria-label={workflowLabels[workflow]}
            className="staging-certificate-status-badge"
          >
            {workflowLabels[workflow]}
          </Badge>
        </Tooltip>
      ))}
    </Group>
  );
}
