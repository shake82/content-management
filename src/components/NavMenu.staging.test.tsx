import { cleanup, screen } from '@testing-library/react';
import { renderApp } from '../test/render';
import { NavMenu } from './NavMenu';

it('shows Staging Certificates only when the user has the staging certificate permission', () => {
  const permittedUser = {
    name: 'Taylor Morgan',
    email: 'taylor@example.com',
    permissions: { MANAGE_STAGING_CERTS: true },
  };
  renderApp(<NavMenu />, {
    route: '/staging/apps/prod/payments',
    currentUser: permittedUser,
  });

  expect(screen.getByRole('link', { name: 'Staging Certificates' })).toHaveAttribute('href', '/staging');
  expect(screen.getByRole('link', { name: 'Staging Certificates' })).toHaveAttribute('data-variant', 'light');

  cleanup();
  renderApp(<NavMenu />, {
    route: '/staging',
    currentUser: { ...permittedUser, permissions: {} },
  });
  expect(screen.queryByRole('link', { name: 'Staging Certificates' })).not.toBeInTheDocument();
});
