import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/render';
import { CertificateCatalogTable } from './CertificateCatalogTable';
import { certificateCatalogFixture } from './certificateCatalogTestFixture';

it('renders certificate columns, validity details, and expanded chain and references', async () => {
  renderApp(<CertificateCatalogTable items={certificateCatalogFixture.content} />);

  expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Is Valid' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Expiration' })).toBeInTheDocument();
  expect(screen.getByText('Payments leaf certificate')).toBeInTheDocument();

  await userEvent.hover(screen.getByText('No'));
  expect(await screen.findByText('HIGH: expiring certificate')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Expand Payments leaf certificate' }));
  expect(screen.getByRole('button', { name: 'Collapse Payments leaf certificate' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('heading', { name: 'Certificate chain' })).toBeInTheDocument();
  expect(screen.getByText('Root CA')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'References' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'apps/prod/payments' })).toHaveAttribute(
    'href',
    '/vault/keystore?secretEngine=kubernetes&path=apps%2Fprod%2Fpayments&prop=keystore',
  );
});
