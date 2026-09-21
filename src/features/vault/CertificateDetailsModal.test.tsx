import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../test/render';
import { CertificateDetailsModal } from './CertificateDetailsModal';

it('renders certificate details with legacy fingerprint support and closes', async () => {
  const onClose = vi.fn();
  renderApp(<CertificateDetailsModal certificate={{
    shortName: 'Test cert', startDate: null, endDate: null, revocationDate: null, version: 3,
    subject: 'CN=TEST', issuer: 'CN=ROOT', hexSerialNumber: '0x01', fingerpring: 'legacy-fingerprint',
  }} onClose={onClose} />);

  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('CN=TEST')).toBeInTheDocument();
  expect(within(dialog).getByText('legacy-fingerprint')).toBeInTheDocument();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close certificate details' }));
  expect(onClose).toHaveBeenCalledOnce();
});
