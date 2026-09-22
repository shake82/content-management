import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { GeneratedPemResult } from './GeneratedPemResult';

it('renders both generated PEM values and offers a reset action', async () => {
  const onReset = vi.fn();
  renderApp(
    <GeneratedPemResult
      result={{ privateKey: 'FAKE-PRIVATE-PEM', certificateRequest: 'FAKE-CSR-PEM' }}
      onReset={onReset}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Certificate request result' })).toBeInTheDocument();
  expect(screen.getByLabelText('Private key PEM')).toHaveTextContent('FAKE-PRIVATE-PEM');
  expect(screen.getByLabelText('Certificate request PEM')).toHaveTextContent('FAKE-CSR-PEM');
  expect(screen.getByRole('button', { name: 'Copy private key' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download certificate request' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Generate another' }));
  expect(onReset).toHaveBeenCalledOnce();
});
