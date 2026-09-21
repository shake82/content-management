import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { catalogFixture } from '../../test/fixtures';
import { renderApp } from '../../test/render';
import { useVaultCatalog } from './useVaultCatalog';
import { VaultViewPage } from './VaultViewPage';

vi.mock('./useVaultCatalog', () => ({ useVaultCatalog: vi.fn() }));

it('loads its folder from the URL and keeps breadcrumb navigation in sync', async () => {
  vi.mocked(useVaultCatalog).mockReturnValue({
    status: 'success', data: catalogFixture, refetch: vi.fn(),
  });
  function LocationProbe() {
    return <output aria-label="Current URL">{useLocation().pathname}</output>;
  }
  renderApp(
    <Routes>
      <Route path="/vault/*" element={<><VaultViewPage /><LocationProbe /></>} />
    </Routes>,
    { route: '/vault/engine-b/apps/dev/search' },
  );

  expect(screen.getByRole('heading', { name: 'Vault View' })).toBeInTheDocument();
  expect(screen.getByLabelText('Current URL')).toHaveTextContent('/vault/engine-b/apps/dev/search');
  expect(screen.queryByRole('heading', { name: 'Folders' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Key store records' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View keystore #2' })).toHaveAttribute(
    'href',
    '/vault/keystore?engine=engine-b&path=apps%2Fdev%2Fsearch&prop=truststore',
  );
  await userEvent.click(screen.getByRole('link', { name: 'dev' }));
  expect(screen.getByLabelText('Current URL')).toHaveTextContent('/vault/engine-b/apps/dev');
  expect(screen.getByRole('button', { name: 'search' })).toBeInTheDocument();
});
