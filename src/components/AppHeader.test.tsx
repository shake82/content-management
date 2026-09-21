import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../test/render';
import { AppHeader } from './AppHeader';

vi.mock('../features/user/CurrentUser', () => ({ CurrentUser: () => <span>Current user</span> }));

it('renders product identity, navigation, user area, and mobile toggle', async () => {
  const toggle = vi.fn();
  renderApp(<AppHeader mobileOpened={false} onMobileToggle={toggle} />, {
    route: '/vault',
    currentUser: { name: 'Maya Chen', email: 'maya@example.com', permissions: { 'vault.view': true } },
  });

  expect(screen.getByText('PHO')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'ELIS vault' })).toHaveAttribute('src', '/elis-vault-icon-readable.svg');
  expect(screen.getByText('Vault certificate inventory')).toBeInTheDocument();
  expect(screen.getByText('Current user')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Switch to (dark|light) mode/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
  expect(toggle).toHaveBeenCalledOnce();
});
