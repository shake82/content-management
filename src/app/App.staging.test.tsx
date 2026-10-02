import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { getStagingCertificateKeys, getStagingCertificateStatus } from '../api/stagingCertificateApi';
import { getCurrentUser } from '../api/userApi';
import { getVaultCatalog } from '../api/vaultApi';
import { catalogFixture } from '../test/fixtures';
import { renderApp } from '../test/render';
import { App } from './App';

vi.mock('../api/userApi', () => ({ getCurrentUser: vi.fn() }));
vi.mock('../api/vaultApi', () => ({ getVaultCatalog: vi.fn() }));
vi.mock('../api/stagingCertificateApi', () => ({
  getStagingCertificateKeys: vi.fn(),
  getStagingCertificateStatus: vi.fn(),
  createStagingCertificate: vi.fn(),
  STAGING_CERTIFICATE_STATUS_CONCURRENCY: 3,
}));

it('protects staging certificate routes and renders them for authorized users', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    name: 'Maya Chen',
    email: 'maya@example.com',
    permissions: { MANAGE_STAGING_CERTS: true },
  });
  vi.mocked(getStagingCertificateKeys).mockResolvedValue(['apps/prod/payments']);
  vi.mocked(getStagingCertificateStatus).mockResolvedValue({
    hasMissingKeyPair: false,
    hasMissingKeyStore: true,
    hasPendingCertRequest: false,
    issues: [],
  });

  renderApp(<App />, { route: '/staging-certificates' });

  expect(await screen.findByRole('heading', { name: 'Staging Certificates' })).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: 'apps/prod/payments' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Staging Certificates' })[0]).toHaveAttribute('data-variant', 'light');
});

it('redirects staging certificate routes when the user lacks permission', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    name: 'Maya Chen',
    email: 'maya@example.com',
    permissions: {},
  });
  vi.mocked(getVaultCatalog).mockResolvedValue(catalogFixture);

  renderApp(<App />, { route: '/staging-certificates/detail?key=apps%2Fprod%2Fpayments' });

  expect(await screen.findByRole('heading', { name: 'Vault View' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Staging Certificates' })).not.toBeInTheDocument();
});
