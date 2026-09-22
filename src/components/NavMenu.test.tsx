import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/render';
import { NavMenu } from './NavMenu';

const currentUser = {
  name: 'Taylor Morgan',
  email: 'taylor@example.com',
  permissions: {
    'reports.view': true,
  },
};

it('highlights the active route and exposes grouped tool destinations', async () => {
  renderApp(<NavMenu />, { route: '/tools/import', currentUser });

  expect(screen.getByRole('button', { name: /Tools/ })).toHaveAttribute('data-variant', 'light');
  expect(screen.getByRole('link', { name: 'Certificate View' })).toHaveAttribute('href', '/certificates');
  expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Tools/ }));
  expect(screen.getByText('Import certificates').closest('a')).toHaveAttribute('href', '/tools/import');
  expect(screen.getByText('Import certificates').closest('a')).toHaveAttribute('data-active', 'true');
  expect(screen.getByText('Import certificates').closest('a')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Audit history').closest('a')).toHaveAttribute('href', '/tools/audit');
  expect(screen.getByText('Local Cert Viewer').closest('a')).toHaveAttribute('href', '/tools/local-cert-viewer');
  expect(screen.getByText('Certificate Request Generator').closest('a')).toHaveAttribute('href', '/tools/certificate-request-generator');
});

it('hides Reports when the user lacks its permission and leaves other destinations accessible', async () => {
  renderApp(<NavMenu />, {
    currentUser: { ...currentUser, permissions: {} },
  });

  expect(screen.getByRole('link', { name: 'Vault View' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Certificate View' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /Tools/ }));
  expect(screen.getByText('Local Cert Viewer')).toBeInTheDocument();
  expect(screen.getByText('Import certificates')).toBeInTheDocument();
  expect(screen.getByText('Audit history')).toBeInTheDocument();
  expect(screen.getByText('Certificate Request Generator')).toBeInTheDocument();
});
