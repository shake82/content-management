import { cleanup, screen } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { StagingCertificateDetailPage } from './StagingCertificateDetailPage';

it('renders the selected staging certificate key with breadcrumb and missing-key state', () => {
  renderApp(<StagingCertificateDetailPage />, {
    route: '/staging-certificates/detail?key=apps%2Fprod%2Fpayments',
  });

  expect(screen.getByRole('heading', { name: 'apps/prod/payments' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Staging Certificates' })).toHaveAttribute('href', '/staging-certificates');

  cleanup();
  renderApp(<StagingCertificateDetailPage />, { route: '/staging-certificates/detail' });
  expect(screen.getByText('A staging certificate key is required to view details.')).toBeInTheDocument();
});
