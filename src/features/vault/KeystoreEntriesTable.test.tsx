import { screen, within } from '@testing-library/react';
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
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('heading', { name: 'Certificate Detail' })).toBeInTheDocument();
  expect(within(dialog).queryByText('fixture-fingerprint')).not.toBeInTheDocument();
  await userEvent.click(screen.getByText('With issues'));
  expect(screen.getByText('No key entries match this filter.')).toBeInTheDocument();
});

it('supports entries with a null certificate list', async () => {
  const entry = {
    ...parsedSecretFixture.keyEntries[0]!,
    alias: 'certificate-free-entry',
    certificates: null,
  };
  renderApp(<KeystoreEntriesTable entries={[entry]} />);

  await userEvent.type(screen.getByRole('textbox', { name: 'Search key entries' }), 'certificate-free');
  expect(screen.getByText('certificate-free-entry')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Expand certificate-free-entry' }));
  expect(screen.getByText('No certificates are attached to this entry.')).toBeInTheDocument();
});
