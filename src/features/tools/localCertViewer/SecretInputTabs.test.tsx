import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { SecretInputTabs } from './SecretInputTabs';

it('switches between file and text input modes', async () => {
  renderApp(<SecretInputTabs onFileSubmit={vi.fn()} onTextSubmit={vi.fn()} />);

  expect(screen.getByRole('tab', { name: 'Upload file' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText('Drop a certificate or secret file here')).toBeVisible();
  await userEvent.click(screen.getByRole('tab', { name: 'Paste secret' }));
  expect(screen.getByRole('tab', { name: 'Paste secret' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('textbox', { name: 'Secret Value' })).toBeVisible();
});
