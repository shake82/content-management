import { screen } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { certificateCatalogFixture } from './certificateCatalogTestFixture';
import { CertificateReferencesTable } from './CertificateReferencesTable';

it('renders certificate references with links to keystore details', () => {
  renderApp(<CertificateReferencesTable references={certificateCatalogFixture.content[0]!.vaultReferences} />);

  expect(screen.getByRole('columnheader', { name: 'Path' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'apps/prod/payments (opens in a new tab)' });
  expect(link).toHaveAttribute(
    'href',
    '/vault/keystore?engine=kubernetes&path=apps%2Fprod%2Fpayments&prop=keystore',
  );
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(link.querySelector('.tabler-icon-external-link')).toBeInTheDocument();
  expect(screen.getByText('JKS')).toBeInTheDocument();
});
