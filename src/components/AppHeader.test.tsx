import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../test/render';
import { AppHeader } from './AppHeader';

vi.mock('../features/user/CurrentUser', () => ({ CurrentUser: () => <span>Current user</span> }));

it('renders product identity, navigation, user area, and mobile toggle', async () => {
  const toggle = vi.fn();
  renderApp(<AppHeader mobileOpened={false} onMobileToggle={toggle} />, { route: '/vault' });

  expect(screen.getByText('Secret Browser')).toBeInTheDocument();
  expect(screen.getByText('Vault certificate inventory')).toBeInTheDocument();
  expect(screen.getByText('Current user')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Switch to (dark|light) mode/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
  expect(toggle).toHaveBeenCalledOnce();
});
