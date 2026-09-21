import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../test/render';
import { CertificateDetailsModal } from './CertificateDetailsModal';
import type { KeystoreCertificate } from './detailTypes';

const certificate: KeystoreCertificate = {
  shortName: 'Test cert',
  startDate: '2020-01-01T12:00:000Z',
  endDate: '2020-02-01T12:00:000Z',
  revocationDate: '2020-01-15T12:00:000Z',
  version: 3,
  subject: 'CN=TEST',
  issuer: 'CN=ROOT',
  hexSerialNumber: '0x01',
  fingerpring: 'legacy-fingerprint',
};

it('renders only the requested certificate details and closes', async () => {
  const onClose = vi.fn();
  renderApp(<CertificateDetailsModal certificate={certificate} onClose={onClose} />);

  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('Certificate Detail')).toBeInTheDocument();
  expect(within(dialog).getByText('CN=TEST')).toBeInTheDocument();
  expect(within(dialog).getByText('CN=ROOT')).toBeInTheDocument();
  expect(within(dialog).getByText('0x01')).toBeInTheDocument();
  expect(within(dialog).getByText('Jan 1, 2020')).toBeInTheDocument();
  expect(within(dialog).getByText('Feb 1, 2020')).toHaveStyle({ color: 'var(--mantine-color-red-6)' });
  expect(within(dialog).getByText('Jan 15, 2020')).toHaveStyle({ color: 'var(--mantine-color-red-6)' });
  expect(within(dialog).queryByText('Version')).not.toBeInTheDocument();
  expect(within(dialog).queryByText('Fingerprint')).not.toBeInTheDocument();
  expect(within(dialog).queryByText('legacy-fingerprint')).not.toBeInTheDocument();

  await userEvent.click(within(dialog).getByRole('button', { name: 'Close certificate details' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('does not render revocation date when empty', () => {
  renderApp(<CertificateDetailsModal certificate={{ ...certificate, revocationDate: '' }} onClose={vi.fn()} />);

  expect(within(screen.getByRole('dialog')).queryByText('Revocation Date')).not.toBeInTheDocument();
});
