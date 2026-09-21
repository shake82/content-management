import { screen } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { certificateCatalogFixture } from './certificateCatalogTestFixture';
import { CertificateReferencesTable } from './CertificateReferencesTable';

it('renders certificate references with links to keystore details', () => {
  renderApp(<CertificateReferencesTable references={certificateCatalogFixture.content[0]!.vaultReferences} />);

  expect(screen.getByRole('columnheader', { name: 'Path' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'apps/prod/payments' })).toHaveAttribute('href', '/vault/keystore/12');
  expect(screen.getByText('JKS')).toBeInTheDocument();
});
