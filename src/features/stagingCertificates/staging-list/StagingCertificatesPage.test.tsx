import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { StagingCertificatesPage } from './StagingCertificatesPage';
import { useRenderedStagingCertificateStatuses } from './useRenderedStagingCertificateStatuses';
import { useStagingCertificateKeys } from './useStagingCertificateKeys';

vi.mock('./useStagingCertificateKeys', () => ({ useStagingCertificateKeys: vi.fn() }));
vi.mock('./useRenderedStagingCertificateStatuses', () => ({ useRenderedStagingCertificateStatuses: vi.fn() }));

const stagingKeys = Array.from({ length: 16 }, (_, index) => `apps/prod/cert-${index + 1}`);

it('renders keys with client-side filtering, paging, visible status loading, and the new modal', async () => {
  vi.mocked(useStagingCertificateKeys).mockReturnValue({
    status: 'success',
    data: stagingKeys,
    refetch: vi.fn(),
  });
  vi.mocked(useRenderedStagingCertificateStatuses).mockReturnValue({
    statuses: {},
    retryStatus: vi.fn(),
  });

  renderApp(<StagingCertificatesPage />);

  expect(screen.getByRole('heading', { name: 'Staging Certificates' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'apps/prod/cert-1' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'apps/prod/cert-16' })).not.toBeInTheDocument();
  expect(useRenderedStagingCertificateStatuses).toHaveBeenLastCalledWith(stagingKeys.slice(0, 15));

  await userEvent.click(screen.getByRole('button', { name: '2' }));
  expect(screen.getByRole('link', { name: 'apps/prod/cert-16' })).toBeInTheDocument();
  expect(useRenderedStagingCertificateStatuses).toHaveBeenLastCalledWith(['apps/prod/cert-16']);

  await userEvent.clear(screen.getByRole('textbox', { name: 'Filter staging certificates' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Filter staging certificates' }), 'cert-3');
  expect(screen.getByRole('link', { name: 'apps/prod/cert-3' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'apps/prod/cert-16' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'New' }));
  expect(await screen.findByText('New staging certificate')).toBeInTheDocument();
});
