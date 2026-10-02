import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../test/render';
import { StagingCertificateValidityIndicators } from './StagingCertificateValidityIndicators';

it('renders validity, workflow, loading, and retryable error indicators', async () => {
  const retry = vi.fn();
  renderApp(
    <StagingCertificateValidityIndicators
      state={{
        status: 'success',
        data: {
          hasMissingKeyPair: false,
          hasMissingKeystore: true,
          hasPendingCertRequest: true,
          issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }],
        },
      }}
      onRetry={retry}
    />,
  );

  expect(screen.getByLabelText('High severity issues')).toBeInTheDocument();
  expect(screen.getByLabelText('Missing keystore')).toBeInTheDocument();
  expect(screen.getByLabelText('Pending certificate request')).toBeInTheDocument();
  await userEvent.hover(screen.getByText('HIGH'));
  expect(await screen.findByText('HIGH: Expired Certificate')).toBeInTheDocument();

  cleanup();
  renderApp(<StagingCertificateValidityIndicators state={{ status: 'loading' }} onRetry={retry} />);
  expect(screen.getByText('Loading')).toBeInTheDocument();

  cleanup();
  renderApp(<StagingCertificateValidityIndicators state={{ status: 'error', error: new Error('Failed') }} onRetry={retry} />);
  await userEvent.click(screen.getByRole('button', { name: 'Retry status' }));
  expect(retry).toHaveBeenCalledOnce();
});
