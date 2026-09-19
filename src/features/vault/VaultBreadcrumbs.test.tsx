import { screen } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { VaultBreadcrumbs } from './VaultBreadcrumbs';

it('renders every path segment as a stable ancestor URL', () => {
  renderApp(<VaultBreadcrumbs path="platform/production/payments" />);

  expect(screen.getByRole('link', { name: 'Vault' })).toHaveAttribute('href', '/vault');
  expect(screen.getByRole('link', { name: 'platform' })).toHaveAttribute('href', '/vault/platform');
  expect(screen.getByRole('link', { name: 'production' })).toHaveAttribute('href', '/vault/platform/production');
  expect(screen.getByRole('link', { name: 'payments' })).toHaveAttribute('href', '/vault/platform/production/payments');
  expect(screen.getByRole('link', { name: 'payments' })).toHaveAttribute('aria-current', 'page');
});
