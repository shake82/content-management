import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { catalogFixture } from '../../test/fixtures';
import { renderApp } from '../../test/render';
import { VaultItemsTable } from './VaultItemsTable';

it('renders key store details, issue tooltip, and detail navigation', async () => {
  renderApp(<VaultItemsTable items={[catalogFixture[0]]} />);

  expect(screen.getByText('#1')).toBeInTheDocument();
  expect(screen.getByText('store')).toBeInTheDocument();
  expect(screen.getByText('JKS')).toBeInTheDocument();
  expect(screen.getByText('v2')).toBeInTheDocument();
  expect(screen.getByText('1 key pair')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View keystore #1' })).toHaveAttribute(
    'href',
    '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store',
  );
  await userEvent.hover(screen.getByText('1 high'));
  expect(await screen.findByText('expired certificate: 1')).toBeInTheDocument();
});
