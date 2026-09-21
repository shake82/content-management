import { screen } from '@testing-library/react';
import { renderApp } from '../../../test/render';
import { IssueSeveritySummary } from './IssueSeveritySummary';

it('renders readable issue counts and an empty state', () => {
  renderApp(<>
    <IssueSeveritySummary summary={{ HIGH: { EXPIRED_CERTIFICATE: 2 } }} />
    <IssueSeveritySummary summary={{}} />
  </>);
  expect(screen.getByText('HIGH')).toBeInTheDocument();
  expect(screen.getByText('expired certificate: 2')).toBeInTheDocument();
  expect(screen.getByText('No parser issues found.')).toBeInTheDocument();
});
