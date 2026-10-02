import { screen } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { StagingCertificateBreadcrumbs } from './StagingCertificateBreadcrumbs';

it('renders a link back to the staging certificate list and the current key', () => {
  renderApp(<StagingCertificateBreadcrumbs certificateKey="apps/prod/payments" />);

  expect(screen.getByRole('navigation', { name: 'Staging certificate path' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Staging Certificates' })).toHaveAttribute('href', '/staging');
  expect(screen.getByText('apps/prod/payments')).toHaveAttribute('aria-current', 'page');
});
