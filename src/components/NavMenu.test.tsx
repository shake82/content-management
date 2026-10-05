import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/render';
import { NavMenu } from './NavMenu';

const currentUser = {
  name: 'Taylor Morgan',
  email: 'taylor@example.com',
  permissions: {},
};

it('highlights the active route and exposes grouped tool destinations', async () => {
  renderApp(<NavMenu />, { route: '/tools/local-cert-viewer', currentUser });

  expect(screen.getByRole('button', { name: /Tools/ })).toHaveAttribute('data-variant', 'light');
  expect(screen.getByRole('link', { name: 'Certificate View' })).toHaveAttribute('href', '/certificates');
  expect(screen.queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Tools/ }));
  expect(screen.getByText('Local Cert Viewer').closest('a')).toHaveAttribute('href', '/tools/local-cert-viewer');
  expect(screen.getByText('Local Cert Viewer').closest('a')).toHaveAttribute('data-active', 'true');
  expect(screen.getByText('Local Cert Viewer').closest('a')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Certificate Request Generator').closest('a')).toHaveAttribute('href', '/tools/certificate-request-generator');
  expect(screen.queryByText('Import certificates')).not.toBeInTheDocument();
  expect(screen.queryByText('Audit history')).not.toBeInTheDocument();
});

it('leaves implemented destinations accessible', async () => {
  renderApp(<NavMenu />, { currentUser });

  expect(screen.getByRole('link', { name: 'Vault View' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Certificate View' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /Tools/ }));
  expect(screen.getByText('Local Cert Viewer')).toBeInTheDocument();
  expect(screen.getByText('Certificate Request Generator')).toBeInTheDocument();
});
