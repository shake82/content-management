import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/render';
import { ThemeToggle } from './ThemeToggle';

it('switches between light and dark color schemes', async () => {
  renderApp(<ThemeToggle />);

  const darkModeButton = screen.getByRole('button', { name: 'Switch to dark mode' });
  expect(darkModeButton).toBeInTheDocument();
  await userEvent.click(darkModeButton);
  expect(await screen.findByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
});
