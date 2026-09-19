import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { renderApp } from '../test/render';
import { AppLayout } from './AppLayout';

vi.mock('./AppHeader', () => ({ AppHeader: () => <header>Application header</header> }));

it('renders the application shell and nested route content', () => {
  renderApp(
    <Routes><Route element={<AppLayout />}><Route path="/vault" element={<main>Vault content</main>} /></Route></Routes>,
    { route: '/vault' },
  );

  expect(screen.getByText('Application header')).toBeInTheDocument();
  expect(screen.getByText('Vault content')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Vault View' })).toBeInTheDocument();
});
