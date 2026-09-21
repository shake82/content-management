import { buildCertificateChain, getCertificateTitle } from './certificateChain';
import type { KeystoreCertificate } from './detailTypes';

const certificates: KeystoreCertificate[] = [
  {
    shortName: 'Root',
    startDate: null,
    endDate: null,
    revocationDate: null,
    version: 3,
    subject: 'CN=ROOT,C=US',
    issuer: 'CN=ROOT,C=US',
    hexSerialNumber: '0x01',
  },
  {
    shortName: 'Intermediate',
    startDate: null,
    endDate: null,
    revocationDate: null,
    version: 3,
    subject: 'CN=MID,C=US',
    issuer: 'CN=ROOT,C=US',
    hexSerialNumber: '0x02',
  },
  {
    shortname: 'Leaf',
    startDate: null,
    endDate: null,
    revocationDate: null,
    version: 3,
    subject: 'CN=LEAF,C=US',
    issuer: 'CN=MID,C=US',
    hexSerialNumber: '0x03',
  },
];

it('builds a certificate tree by matching issuer to parent subject', () => {
  const [root] = buildCertificateChain(certificates);

  expect(getCertificateTitle(certificates[2])).toBe('Leaf');
  expect(root.certificate.subject).toBe('CN=ROOT,C=US');
  expect(root.children[0].certificate.subject).toBe('CN=MID,C=US');
  expect(root.children[0].children[0].certificate.subject).toBe('CN=LEAF,C=US');
});
