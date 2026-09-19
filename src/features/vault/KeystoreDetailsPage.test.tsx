import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { catalogFixture } from '../../test/fixtures';
import { renderApp } from '../../test/render';
import { KeystoreDetailsPage } from './KeystoreDetailsPage';
import { useVaultCatalog } from './useVaultCatalog';

vi.mock('./useVaultCatalog', () => ({ useVaultCatalog: vi.fn() }));

it('renders the detail title and effective-path breadcrumbs', () => {
  vi.mocked(useVaultCatalog).mockReturnValue({
    status: 'success', data: catalogFixture, refetch: vi.fn(),
  });
  renderApp(
    <Routes><Route path="/vault/keystore/:catalogId" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore/1' },
  );

  expect(screen.getByRole('heading', { name: 'Keystore Details' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Keystore path' })).toHaveTextContent('Vault View/engine-a/apps/prod/payments/store');
  expect(screen.getByRole('link', { name: 'Vault View' })).toHaveAttribute('href', '/vault');
  expect(screen.getByRole('link', { name: 'engine-a' })).toHaveAttribute('href', '/vault/engine-a');
  expect(screen.getByRole('link', { name: 'apps' })).toHaveAttribute('href', '/vault/engine-a/apps');
  expect(screen.getByRole('link', { name: 'payments' })).toHaveAttribute('href', '/vault/engine-a/apps/prod/payments');
  expect(screen.getByText('store')).toHaveAttribute('aria-current', 'page');
});
