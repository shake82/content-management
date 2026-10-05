import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { createStagingCertificate } from '../../../api/stagingCertificateApi';
import { renderApp } from '../../../test/render';
import { NewStagingCertificateModal } from './NewStagingCertificateModal';

vi.mock('../../../api/stagingCertificateApi', () => ({ createStagingCertificate: vi.fn() }));

beforeEach(() => {
  vi.mocked(createStagingCertificate).mockReset();
});

it('submits the reusable certificate request fields and keeps validation behavior in the modal', async () => {
  const close = vi.fn();
  vi.mocked(createStagingCertificate).mockResolvedValue({ path: 'apps/prod/payments', version: 1 });
  renderApp(<NewStagingCertificateModal opened onClose={close} />);

  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));
  expect(screen.getByText('Add at least one Common Name (CN) before generating the request.')).toBeInTheDocument();

  await userEvent.type(screen.getByRole('textbox', { name: 'Subject value' }), 'payments.example.gov');
  await userEvent.click(screen.getByRole('button', { name: 'Add subject' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Alternate DNS subjects' }), 'api.example.gov');
  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));

  await waitFor(() => expect(createStagingCertificate).toHaveBeenCalledWith({
    subject: 'CN=payments.example.gov,OU=Devices,OU=USCIS,OU=Department of Homeland Security,O=U.S. Government,C=US',
    alternateSubjects: ['api.example.gov'],
  }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
