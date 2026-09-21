import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderApp } from '../../test/render';
import { certificateCatalogFixture } from './certificateCatalogTestFixture';
import { CertificateViewPage } from './CertificateViewPage';
import { useCertificateCatalog } from './useCertificateCatalog';

vi.mock('./useCertificateCatalog', () => ({ useCertificateCatalog: vi.fn() }));

beforeEach(() => {
  vi.mocked(useCertificateCatalog).mockReturnValue({
    status: 'success',
    data: certificateCatalogFixture,
    refetch: vi.fn(),
  });
});

it('renders the catalog and updates API paging and search inputs', async () => {
  renderApp(<CertificateViewPage />);

  expect(screen.getByRole('heading', { name: 'Certificate View' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Certificates' })).toBeInTheDocument();
  expect(screen.getByText('18 total')).toBeInTheDocument();
  expect(useCertificateCatalog).toHaveBeenLastCalledWith(0, 15, '');

  const search = screen.getByRole('textbox', { name: 'Search certificates' });
  await userEvent.type(search, 'payments');
  expect(search).toHaveValue('payments');
  expect(useCertificateCatalog).toHaveBeenLastCalledWith(0, 15, '');
  await waitFor(() => expect(useCertificateCatalog).toHaveBeenLastCalledWith(0, 15, 'payments'));

  await userEvent.click(screen.getByRole('button', { name: '2' }));
  expect(useCertificateCatalog).toHaveBeenLastCalledWith(1, 15, 'payments');

  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(search).toHaveValue('');
  await waitFor(() => expect(useCertificateCatalog).toHaveBeenLastCalledWith(0, 15, ''));
});
