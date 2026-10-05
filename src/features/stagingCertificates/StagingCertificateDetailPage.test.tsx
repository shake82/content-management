import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  completeCertificateRequest,
  createStagingCertificate,
  generateKeyStore,
  getStagingCertificateDetail,
} from '../../api/stagingCertificateApi';
import { renderApp } from '../../test/render';
import { StagingCertificateDetailPage } from './StagingCertificateDetailPage';

function renderDetail(route: string) {
  return renderApp(
    <Routes>
      <Route path="/staging/*" element={<StagingCertificateDetailPage />} />
    </Routes>,
    { route },
  );
}

vi.mock('../../api/stagingCertificateApi', () => ({
  getStagingCertificateDetail: vi.fn(),
  completeCertificateRequest: vi.fn(),
  createStagingCertificate: vi.fn(),
  generateKeyStore: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getStagingCertificateDetail).mockReset();
  vi.mocked(completeCertificateRequest).mockReset();
  vi.mocked(createStagingCertificate).mockReset();
  vi.mocked(generateKeyStore).mockReset();
});

it('loads a path-based staging certificate, completes a pending request, and handles missing keys', async () => {
  vi.mocked(getStagingCertificateDetail).mockResolvedValue({
    hasMissingKeyStore: true,
    certificateRequestInfo: {
      certificateRequest: { type: 'PEM' },
      privateKey: { type: 'PEM' },
      vaultPath: 'https://vault.example.com/ui/apps/prod/payments',
    },
    keyPair: {
      type: 'PEM',
      keyEntries: [{
        alias: 'Primary',
        entryType: 'KEY_PAIR',
        expirationDate: '2026-06-24T00:00:00.000Z',
        lastModifiedDate: '2026-06-24T00:00:00.000Z',
        certificates: [],
        issues: [],
      }],
    },
  });
  vi.mocked(completeCertificateRequest).mockResolvedValue({ hasMissingKeyStore: false, certificateRequestInfo: null });

  renderDetail('/staging/apps/prod/payments');

  expect(await screen.findByRole('heading', { name: 'apps/prod/payments' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Staging Certificates' })).toHaveAttribute('href', '/staging');
  expect(screen.getByText(/There is a current pending certificate request/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View In Vault' })).toHaveAttribute('href', 'https://vault.example.com/ui/apps/prod/payments');
  expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
  expect(screen.getByText('Primary')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Key Pair' })).not.toBeInTheDocument();
  expect(screen.queryByText('PEM')).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Search key entries' })).not.toBeInTheDocument();
  expect(screen.queryByRole('radiogroup', { name: 'Filter key entries' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Upload Certificate' }));
  const uploadDialog = await screen.findByRole('dialog', { name: 'Complete certificate request' });
  const uploadSubmit = within(uploadDialog).getByRole('button', { name: 'Upload Certificate' });
  await userEvent.click(uploadSubmit);
  expect(await within(uploadDialog).findByText('New Certificate is required.')).toBeInTheDocument();

  await userEvent.type(within(uploadDialog).getByRole('textbox', { name: 'New Certificate' }), '-----BEGIN CERTIFICATE-----');
  await userEvent.type(within(uploadDialog).getByRole('textbox', { name: 'Parent Chain' }), '-----BEGIN CERTIFICATE-----parent');
  await userEvent.click(uploadSubmit);

  await waitFor(() => expect(completeCertificateRequest).toHaveBeenCalledWith('apps/prod/payments', {
    cert: '-----BEGIN CERTIFICATE-----',
    parentChain: '-----BEGIN CERTIFICATE-----parent',
  }));
  await waitFor(() => expect(getStagingCertificateDetail).toHaveBeenCalledTimes(2));

  cleanup();
  renderDetail('/staging');
  expect(screen.getByText('A staging certificate key is required to view details.')).toBeInTheDocument();
});

it('shows new request and generate keystore actions when no request is pending', async () => {
  vi.mocked(getStagingCertificateDetail).mockResolvedValue({
    hasMissingKeyStore: true,
    certificateRequestInfo: null,
    keyPair: {
      type: 'PEM',
      keyEntries: [{
        alias: 'Primary',
        entryType: 'KEY_PAIR',
        expirationDate: null,
        lastModifiedDate: null,
        certificates: [{
          startDate: null,
          endDate: null,
          revocationDate: null,
          version: 1,
          subject: 'CN=payments',
          issuer: 'CN=issuer',
          hexSerialNumber: '01',
        }],
        issues: [],
      }],
    },
  });
  vi.mocked(createStagingCertificate).mockResolvedValue({ path: 'apps/prod/payments', version: 1 });
  vi.mocked(generateKeyStore).mockResolvedValue({ hasMissingKeyStore: false, certificateRequestInfo: null });

  renderDetail('/staging/apps/prod/payments');

  expect(await screen.findByRole('heading', { name: 'apps/prod/payments' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Generate Keystore' }));
  const generateDialog = await screen.findByRole('dialog', { name: 'Generate keystore' });
  const generateSubmit = within(generateDialog).getByRole('button', { name: 'Generate' });
  await userEvent.click(generateSubmit);
  expect(await within(generateDialog).findByText('Parent Chain is required.')).toBeInTheDocument();

  await userEvent.type(within(generateDialog).getByRole('textbox', { name: 'Parent Chain' }), '-----BEGIN CERTIFICATE-----parent');
  await userEvent.click(generateSubmit);

  await waitFor(() => expect(generateKeyStore).toHaveBeenCalledWith('apps/prod/payments', '-----BEGIN CERTIFICATE-----parent'));
  await waitFor(() => expect(getStagingCertificateDetail).toHaveBeenCalledTimes(2));

  await userEvent.click(screen.getByRole('button', { name: 'New' }));
  expect(await screen.findByLabelText('Certificate subjects')).toHaveTextContent('CN=apps/prod/payments');
  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));

  await waitFor(() => expect(createStagingCertificate).toHaveBeenCalledWith({
    subject: 'CN=apps/prod/payments,OU=Devices,OU=USCIS,OU=Department of Homeland Security,O=U.S. Government,C=US',
    alternateSubjects: [],
  }));
  await waitFor(() => expect(getStagingCertificateDetail).toHaveBeenCalledTimes(3));
});

it('generates a keystore without parent chain upload when the first key entry has multiple certificates', async () => {
  vi.mocked(getStagingCertificateDetail).mockResolvedValue({
    hasMissingKeyStore: true,
    certificateRequestInfo: null,
    keyPair: {
      type: 'PEM',
      keyEntries: [{
        alias: 'Primary',
        entryType: 'KEY_PAIR',
        expirationDate: null,
        lastModifiedDate: null,
        certificates: [
          { startDate: null, endDate: null, revocationDate: null, version: 1, subject: 'CN=payments', issuer: 'CN=issuer', hexSerialNumber: '01' },
          { startDate: null, endDate: null, revocationDate: null, version: 1, subject: 'CN=issuer', issuer: 'CN=root', hexSerialNumber: '02' },
        ],
        issues: [],
      }],
    },
  });
  vi.mocked(generateKeyStore).mockResolvedValue({ hasMissingKeyStore: false, certificateRequestInfo: null });

  renderDetail('/staging/apps/prod/payments');

  expect(await screen.findByRole('heading', { name: 'apps/prod/payments' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Generate Keystore' }));
  const generateDialog = await screen.findByRole('dialog', { name: 'Generate keystore' });
  const generateSubmit = within(generateDialog).getByRole('button', { name: 'Generate' });
  expect(within(generateDialog).queryByRole('textbox', { name: 'Parent Chain' })).not.toBeInTheDocument();
  await userEvent.click(generateSubmit);

  await waitFor(() => expect(generateKeyStore).toHaveBeenCalledWith('apps/prod/payments', ''));
  await waitFor(() => expect(getStagingCertificateDetail).toHaveBeenCalledTimes(2));
});
