import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/render';
import { NavMenu } from './NavMenu';

it('highlights the active route and exposes grouped tool destinations', async () => {
  renderApp(<NavMenu />, { route: '/tools/import' });

  expect(screen.getByRole('button', { name: /Tools/ })).toHaveAttribute('data-variant', 'light');
  expect(screen.getByRole('link', { name: 'Certificate View' })).toHaveAttribute('href', '/certificates');
  expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Tools/ }));
  expect(screen.getByText('Import certificates').closest('a')).toHaveAttribute('href', '/tools/import');
  expect(screen.getByText('Import certificates').closest('a')).toHaveAttribute('data-active', 'true');
  expect(screen.getByText('Import certificates').closest('a')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Audit history').closest('a')).toHaveAttribute('href', '/tools/audit');
});
