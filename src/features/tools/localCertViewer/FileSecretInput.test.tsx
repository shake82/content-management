import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { FileSecretInput } from './FileSecretInput';

it('reads a selected file and reports empty files', async () => {
  const onSubmit = vi.fn();
  renderApp(<FileSecretInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('Choose certificate or secret file');
  const validFile = new File(['certificate-content'], 'certificate.pem', { type: 'text/plain' });
  Object.defineProperty(validFile, 'text', { value: vi.fn().mockResolvedValue('certificate-content') });

  await userEvent.upload(input, validFile);
  expect(onSubmit).toHaveBeenCalledWith('certificate-content', 'certificate.pem');
  expect(screen.getByText('certificate.pem')).toBeInTheDocument();

  const emptyFile = new File([], 'empty.pem');
  Object.defineProperty(emptyFile, 'text', { value: vi.fn().mockResolvedValue('') });
  await userEvent.upload(input, emptyFile);
  expect(await screen.findByText('The selected file is empty.')).toBeInTheDocument();
});
