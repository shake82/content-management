import type { KeystoreCertificate } from './detailTypes';

export interface CertificateChainNode {
  certificate: KeystoreCertificate;
  children: CertificateChainNode[];
}

function certificateKey(certificate: KeystoreCertificate) {
  return `${certificate.subject}|${certificate.hexSerialNumber}`;
}

export function getCertificateTitle(certificate: KeystoreCertificate) {
  return certificate.shortName ?? certificate.shortname ?? certificate.subject;
}

export function buildCertificateChain(certificates: KeystoreCertificate[]): CertificateChainNode[] {
  const bySubject = new Map<string, KeystoreCertificate>();
  const childrenByKey = new Map<string, KeystoreCertificate[]>();

  certificates.forEach((certificate) => {
    bySubject.set(certificate.subject, certificate);
    childrenByKey.set(certificateKey(certificate), []);
  });

  const roots: KeystoreCertificate[] = [];

  certificates.forEach((certificate) => {
    const parent = certificate.issuer !== certificate.subject ? bySubject.get(certificate.issuer) : undefined;

    if (!parent) {
      roots.push(certificate);
      return;
    }

    childrenByKey.get(certificateKey(parent))?.push(certificate);
  });

  const toNode = (certificate: KeystoreCertificate): CertificateChainNode => ({
    certificate,
    children: (childrenByKey.get(certificateKey(certificate)) ?? []).map(toNode),
  });

  return roots.map(toNode);
}
