import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/render';
import { parsedSecretFixture } from '../tools/localCertViewer/localCertViewerTestFixture';
import { KeystoreEntriesTable } from './KeystoreEntriesTable';

it('filters entries, expands certificate chains, and opens certificate details', async () => {
  renderApp(<KeystoreEntriesTable entries={parsedSecretFixture.keyEntries} />);

  expect(screen.getByText('payments-cert')).toBeInTheDocument();
  expect(screen.getByText('1 of 1 entries')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Expand payments-cert' }));
  expect(screen.getByText('Certificate chain')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Payments certificate' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent('fixture-fingerprint');
  await userEvent.click(screen.getByText('With issues'));
  expect(screen.getByText('No key entries match this filter.')).toBeInTheDocument();
});
