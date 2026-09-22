import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { downloadTextFile } from './downloadTextFile';
import { PemActionButtons } from './PemActionButtons';

vi.mock('./downloadTextFile', () => ({ downloadTextFile: vi.fn() }));

beforeEach(() => {
  vi.mocked(downloadTextFile).mockReset();
});

it('copies and downloads a PEM value with accessible action names', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  renderApp(<PemActionButtons contents="FAKE-PEM" fileName="private.pem" label="private key" />);

  await userEvent.click(screen.getByRole('button', { name: 'Copy private key' }));
  expect(writeText).toHaveBeenCalledWith('FAKE-PEM');
  expect(screen.getByText('Copied')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Download private key' }));
  expect(downloadTextFile).toHaveBeenCalledWith('FAKE-PEM', 'private.pem');
});
