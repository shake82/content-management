import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { catalogFixture } from '../test/fixtures';
import { renderApp } from '../test/render';
import { getCurrentUser } from '../api/userApi';
import { getVaultCatalog } from '../api/vaultApi';
import { getCertificateCatalog } from '../api/certificateApi';
import { certificateCatalogFixture } from '../features/certificates/certificateCatalogTestFixture';
import { App } from './App';

vi.mock('../api/userApi', () => ({ getCurrentUser: vi.fn() }));
vi.mock('../api/vaultApi', () => ({ getVaultCatalog: vi.fn() }));
vi.mock('../api/certificateApi', () => ({ getCertificateCatalog: vi.fn() }));

it('redirects to the default Vault View and renders the application header', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: 'u1', displayName: 'Maya Chen', email: 'maya@example.com', roles: ['Auditor'],
  });
  vi.mocked(getVaultCatalog).mockResolvedValue(catalogFixture);
  renderApp(<App />);

  expect(screen.getByText('PHO')).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Vault View' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Vault View' })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: 'Vault View' })[0]).toHaveAttribute('data-variant', 'light');
  expect(screen.getByText('Maya Chen')).toBeInTheDocument();
});

it('renders Certificate View at its header navigation route', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: 'u1', displayName: 'Maya Chen', email: 'maya@example.com', roles: ['Auditor'],
  });
  vi.mocked(getCertificateCatalog).mockResolvedValue(certificateCatalogFixture);
  renderApp(<App />, { route: '/certificates' });

  expect(await screen.findByRole('heading', { name: 'Certificate View' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Certificate View' })[0]).toHaveAttribute('data-variant', 'light');
  expect(screen.getByText('Payments leaf certificate')).toBeInTheDocument();
});
