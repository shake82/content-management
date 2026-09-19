import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { getCurrentUser } from '../../api/userApi';
import { renderApp } from '../../test/render';
import { CurrentUser } from './CurrentUser';

vi.mock('../../api/userApi', () => ({
  getCurrentUser: vi.fn(),
}));

it('loads and renders current user information', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: 'user-1', displayName: 'Alex Rivera', email: 'alex@example.com', roles: ['Vault Auditor'],
  });
  renderApp(<CurrentUser />);

  expect(screen.getByLabelText('Loading current user')).toBeInTheDocument();
  expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
  expect(screen.getByText('Vault Auditor')).toBeInTheDocument();
  expect(screen.getByText('AR')).toBeInTheDocument();
});
