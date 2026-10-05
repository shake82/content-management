import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { StagingCertificatesTable } from './StagingCertificatesTable';

it('renders staging certificate rows, status indicators, detail links, and retry actions', async () => {
  const retry = vi.fn();
  renderApp(
    <StagingCertificatesTable
      keys={['apps/prod/payments', 'apps/dev/search']}
      statuses={{
        'apps/prod/payments': {
          status: 'success',
          data: {
            hasMissingKeyPair: false,
            hasMissingKeyStore: true,
            hasPendingCertRequest: false,
            issues: [{ severity: 'HIGH', type: 'EXPIRED_CERTIFICATE' }],
          },
        },
        'apps/dev/search': { status: 'error', error: new Error('Unavailable') },
      }}
      onRetryStatus={retry}
    />,
  );

  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Is Valid' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'apps/prod/payments' })).toHaveAttribute(
    'href',
    '/staging/apps/prod/payments',
  );
  expect(screen.getByLabelText('Missing keystore')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Retry status' }));
  expect(retry).toHaveBeenCalledWith('apps/dev/search');
});
