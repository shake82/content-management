import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { TextSecretInput } from './TextSecretInput';

it('accepts typed and clipboard content and submits trimmed text', async () => {
  const onSubmit = vi.fn();
  const readText = vi.fn().mockResolvedValue('clipboard-pem');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText } });
  renderApp(<TextSecretInput onSubmit={onSubmit} />);

  const input = screen.getByRole('textbox', { name: 'Secret Value' });
  expect(screen.getByText('Paste Base64 encoded or plain PEM content.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Parse secret' })).toBeDisabled();

  await userEvent.click(screen.getByRole('button', { name: 'Paste from clipboard' }));
  expect(input).toHaveValue('clipboard-pem');
  await userEvent.click(screen.getByRole('button', { name: 'Parse secret' }));
  expect(onSubmit).toHaveBeenCalledWith('clipboard-pem');
});
