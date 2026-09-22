export type SubjectCode = 'CN' | 'OU' | 'O' | 'L' | 'ST' | 'C';

export interface CertificateSubjectEntry {
  code: SubjectCode;
  value: string;
}

export interface GenerateCertificateRequestPayload {
  subject: string;
  alternateSubjects: string[];
}

export interface GenerateCertificateRequestResponse {
  privateKey: string;
  certificateRequest: string;
}
