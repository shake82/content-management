import { screen } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { DummyPage } from './DummyPage';

it('renders the destination title and description', () => {
  renderApp(<DummyPage title="Reports" description="Reporting workspace" />);

  expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
  expect(screen.getByText('Reporting workspace')).toBeInTheDocument();
  expect(screen.getByText('Secret Browser')).toBeInTheDocument();
});
