import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderApp } from '../../test/render';
import { PemTextareaWithActions } from './PemTextareaWithActions';

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { readText: vi.fn().mockResolvedValue('clipboard certificate') },
  });
});

it('edits PEM content from typing, clipboard, and selected file', async () => {
  const change = vi.fn();
  const file = new File(['file certificate'], 'cert.pem', { type: 'application/x-pem-file' });
  function Harness() {
    const [value, setValue] = useState('');
    return (
      <PemTextareaWithActions
        label="New Certificate"
        required
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue);
          change(nextValue);
        }}
      />
    );
  }

  renderApp(<Harness />);

  await userEvent.type(screen.getByRole('textbox', { name: 'New Certificate' }), 'typed');
  expect(change).toHaveBeenCalledWith('typed');

  await userEvent.click(screen.getByRole('button', { name: 'Paste New Certificate from clipboard' }));
  await waitFor(() => expect(change).toHaveBeenCalledWith('clipboard certificate'));

  await userEvent.upload(screen.getByLabelText('Choose New Certificate file'), file);
  await waitFor(() => expect(change).toHaveBeenCalledWith('file certificate'));
});
