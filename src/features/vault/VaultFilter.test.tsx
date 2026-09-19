import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderApp } from '../../test/render';
import { VaultFilter } from './VaultFilter';

it('reports and displays the current filter value', async () => {
  function Harness() {
    const [value, setValue] = useState('');
    return <VaultFilter value={value} onChange={setValue} />;
  }
  renderApp(<Harness />);

  const input = screen.getByRole('textbox', { name: 'Filter folders and records' });
  await userEvent.type(input, 'platform');
  expect(input).toHaveValue('platform');
});
