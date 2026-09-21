import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { getCurrentUser } from '../../api/userApi';
import { renderApp } from '../../test/render';
import { CurrentUser } from './CurrentUser';
import { CurrentUserProvider } from './CurrentUserContext';

vi.mock('../../api/userApi', () => ({
  getCurrentUser: vi.fn(),
}));

it('loads and renders current user information', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    name: 'Alex Rivera', email: 'alex@example.com', permissions: { 'vault.view': true },
  });
  renderApp(<CurrentUserProvider><CurrentUser /></CurrentUserProvider>);

  expect(screen.getByLabelText('Loading current user')).toBeInTheDocument();
  expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
  expect(screen.getByText('alex@example.com')).toBeInTheDocument();
  expect(screen.getByText('AR')).toBeInTheDocument();
});
