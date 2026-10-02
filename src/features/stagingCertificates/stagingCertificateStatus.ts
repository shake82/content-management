import type {
  StagingCertificateIndicatorModel,
  StagingCertificateIssue,
  StagingCertificateStatus,
  StagingCertificateWorkflowIndicator,
} from './stagingCertificateTypes';

const severityRank: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export function getHighestIssueSeverity(issues: StagingCertificateIssue[]) {
  if (issues.length === 0) return 'none';

  let highest: 'none' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' = 'none';
  issues.forEach((issue) => {
    const severity = issue.severity.toUpperCase();
    if (!(severity in severityRank)) {
      if (highest === 'none') highest = 'UNKNOWN';
      return;
    }
    if (highest === 'none' || highest === 'UNKNOWN' || severityRank[severity] > severityRank[highest]) {
      highest = severity as 'LOW' | 'MEDIUM' | 'HIGH';
    }
  });
  return highest;
}

export function formatStagingCertificateIssue(issue: StagingCertificateIssue) {
  const type = issue.type
    .toLocaleLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0]!.toLocaleUpperCase() + word.slice(1))
    .join(' ');
  return `${issue.severity.toUpperCase()}: ${type}`;
}

export function getWorkflowIndicators(status: StagingCertificateStatus): StagingCertificateWorkflowIndicator[] {
  const workflow: StagingCertificateWorkflowIndicator[] = [];
  if (status.hasMissingKeyPair) workflow.push('missing-key-pair');
  if (status.hasMissingKeystore) workflow.push('missing-keystore');
  if (status.hasPendingCertRequest) workflow.push('pending-cert-request');
  return workflow;
}

export function getStagingCertificateIndicatorModel(
  status: StagingCertificateStatus,
): StagingCertificateIndicatorModel {
  return {
    validity: {
      severity: getHighestIssueSeverity(status.issues),
      issues: status.issues,
    },
    workflow: getWorkflowIndicators(status),
  };
}
