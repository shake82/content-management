export interface StagingCertificateIssue {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  type: string;
}

export interface StagingCertificateStatus {
  hasMissingKeyPair: boolean;
  hasMissingKeyStore: boolean;
  hasPendingCertRequest: boolean;
  issues: StagingCertificateIssue[];
}

export interface CreateStagingCertificateResponse {
  path: string;
  version: number;
}

export type StagingCertificateStatusLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: StagingCertificateStatus }
  | { status: 'error'; error: Error };

export type StagingCertificateStatusByKey = Record<string, StagingCertificateStatusLoadState>;

export type StagingCertificateWorkflowIndicator =
  | 'missing-key-pair'
  | 'missing-keystore'
  | 'pending-cert-request';

export interface StagingCertificateIndicatorModel {
  validity: {
    severity: 'none' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    issues: StagingCertificateIssue[];
  };
  workflow: StagingCertificateWorkflowIndicator[];
}
