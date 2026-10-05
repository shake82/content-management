import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { generateKeyStore } from '../../api/stagingCertificateApi';
import { renderApp } from '../../test/render';
import { GenerateKeyStoreModal } from './GenerateKeyStoreModal';

vi.mock('../../api/stagingCertificateApi', () => ({ generateKeyStore: vi.fn() }));

beforeEach(() => {
  vi.mocked(generateKeyStore).mockReset();
});

it('requires a parent chain when needed, trims it on submit, and reports success', async () => {
  const close = vi.fn();
  const success = vi.fn();
  vi.mocked(generateKeyStore).mockResolvedValue({ hasMissingKeyStore: false, certificateRequestInfo: null });

  renderApp(
    <GenerateKeyStoreModal
      opened
      path="apps/prod/payments"
      parentChainRequired
      onClose={close}
      onSuccess={success}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
  expect(screen.getByText('Parent Chain is required.')).toBeInTheDocument();

  await userEvent.type(screen.getByRole('textbox', { name: 'Parent Chain' }), '  -----BEGIN CERTIFICATE-----parent  ');
  await userEvent.click(screen.getByRole('button', { name: 'Generate' }));

  await waitFor(() => expect(generateKeyStore).toHaveBeenCalledWith('apps/prod/payments', '-----BEGIN CERTIFICATE-----parent'));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(success).toHaveBeenCalledOnce();
});

it('omits parent chain upload when it is not allowed and keeps API errors in the modal', async () => {
  const close = vi.fn();
  const success = vi.fn();
  vi.mocked(generateKeyStore).mockRejectedValue(new Error('Keystore generation failed'));

  renderApp(
    <GenerateKeyStoreModal
      opened
      path="apps/prod/payments"
      parentChainRequired={false}
      onClose={close}
      onSuccess={success}
    />,
  );

  expect(screen.queryByRole('textbox', { name: 'Parent Chain' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Generate' }));

  await waitFor(() => expect(generateKeyStore).toHaveBeenCalledWith('apps/prod/payments', ''));
  expect(await screen.findByText('Keystore generation failed')).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
  expect(success).not.toHaveBeenCalled();
});
