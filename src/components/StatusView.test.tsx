import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../test/render';
import { StatusView } from './StatusView';

it('renders an actionable error state', async () => {
  const retry = vi.fn();
  renderApp(<StatusView kind="error" message="Catalog unavailable" onRetry={retry} />);

  expect(screen.getByText('Unable to load data')).toBeInTheDocument();
  expect(screen.getByText('Catalog unavailable')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledOnce();
});
