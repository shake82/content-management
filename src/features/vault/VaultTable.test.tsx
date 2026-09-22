import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { catalogFixture } from '../../test/fixtures';
import { renderApp } from '../../test/render';
import { buildVaultTree } from './buildVaultTree';
import { VaultTable } from './VaultTable';

it('renders aggregate folder details and opens the selected folder', async () => {
  const tree = buildVaultTree(catalogFixture);
  const open = vi.fn();
  renderApp(<VaultTable folders={[tree.children['engine-a']]} onOpen={open} />);

  expect(screen.getByRole('button', { name: 'engine-a' })).toBeInTheDocument();
  expect(screen.getAllByText('engine-a')).toHaveLength(2);
  expect(screen.queryByRole('columnheader', { name: 'Secret engines' })).not.toBeInTheDocument();
  expect(screen.getByText('1 high')).toBeInTheDocument();
  await userEvent.hover(screen.getByText('1 high'));
  expect(await screen.findByText('HIGH: ExpiredCertificate')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Open engine-a' }));
  expect(open).toHaveBeenCalledWith('engine-a');
});
