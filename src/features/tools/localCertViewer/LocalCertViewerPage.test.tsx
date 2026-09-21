import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { parseSecret } from '../../../api/toolsApi';
import { renderApp } from '../../../test/render';
import { LocalCertViewerPage } from './LocalCertViewerPage';
import { parsedSecretFixture } from './localCertViewerTestFixture';

vi.mock('../../../api/toolsApi', () => ({ parseSecret: vi.fn() }));

it('parses pasted text, renders results, and resets the view', async () => {
  vi.mocked(parseSecret).mockResolvedValue(parsedSecretFixture);
  renderApp(<LocalCertViewerPage />);

  expect(screen.getByRole('heading', { name: 'Local Cert Viewer' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'Paste secret' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Secret Value' }), 'pem-content');
  await userEvent.click(screen.getByRole('button', { name: 'Parse secret' }));

  expect(await screen.findByRole('heading', { name: 'Parse result' })).toBeInTheDocument();
  expect(parseSecret).toHaveBeenCalledWith({ content: 'pem-content', sourceType: 'text' });
  await userEvent.click(screen.getByRole('button', { name: 'Parse another' }));
  expect(screen.getByRole('heading', { name: 'Local Cert Viewer' })).toBeInTheDocument();
});
