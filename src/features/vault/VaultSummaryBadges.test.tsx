import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/render';
import { VaultSummaryBadges } from './VaultSummaryBadges';

it('renders aggregates and reveals issue details on hover', async () => {
  renderApp(<VaultSummaryBadges summary={{
    itemCount: 3,
    secretEngines: ['kv'],
    keyCountByType: { KEY_PAIR: 2, TRUSTED_CERTIFICATE: 4 },
    issueSummaryBySeverity: { HIGH: { count: 1, issueCountsByType: { EXPIRED_CERTIFICATE: 1 } } },
  }} />);

  expect(screen.getByText('3 stores')).toBeInTheDocument();
  expect(screen.getByText('2 key pair')).toBeInTheDocument();
  expect(screen.getByText('4 trusted certificate')).toBeInTheDocument();
  expect(screen.getByText('1 high')).toBeInTheDocument();
  await userEvent.hover(screen.getByText('1 high'));
  expect(await screen.findByText('expired certificate: 1')).toBeInTheDocument();
});
