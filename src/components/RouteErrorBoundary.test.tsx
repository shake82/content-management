import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { renderApp } from '../test/render';
import { RouteErrorBoundary } from './RouteErrorBoundary';

let shouldThrow = true;

function UnstablePage() {
  if (shouldThrow) throw new Error('Page rendering failed');
  return <main>Recovered page</main>;
}

it('isolates route rendering errors and allows the page to retry', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  shouldThrow = true;

  renderApp(
    <RouteErrorBoundary>
      <UnstablePage />
    </RouteErrorBoundary>,
  );

  expect(screen.getByRole('alert')).toHaveTextContent('Unable to display this page');
  expect(screen.getByText('Page rendering failed')).toBeInTheDocument();

  shouldThrow = false;
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(screen.getByText('Recovered page')).toBeInTheDocument();
  expect(consoleError).toHaveBeenCalled();

  consoleError.mockRestore();
});

it('keeps healthy route content mounted when the location changes', async () => {
  const mounted = vi.fn();

  function VaultPage() {
    useEffect(() => {
      mounted();
    }, []);
    return <Link to="/vault/engine-a/apps">Open path</Link>;
  }

  renderApp(
    <RouteErrorBoundary>
      <VaultPage />
    </RouteErrorBoundary>,
    { route: '/vault' },
  );

  await userEvent.click(screen.getByRole('link', { name: 'Open path' }));
  expect(mounted).toHaveBeenCalledOnce();
});
