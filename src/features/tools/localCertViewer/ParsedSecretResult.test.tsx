import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { parsedSecretFixture } from './localCertViewerTestFixture';
import { ParsedSecretResult } from './ParsedSecretResult';

it('renders parsed metadata and entries and supports reset', async () => {
  const onReset = vi.fn();
  renderApp(<ParsedSecretResult result={parsedSecretFixture} onReset={onReset} />);

  expect(screen.getByText('JKS')).toBeInTheDocument();
  expect(screen.getByText('expired certificate: 1')).toBeInTheDocument();
  expect(screen.getByText('payments-cert')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Parse another' }));
  expect(onReset).toHaveBeenCalledOnce();
});
