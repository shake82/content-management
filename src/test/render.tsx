import { MantineProvider } from '@mantine/core';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { theme } from '../app/theme';
import { CurrentUserStateProvider } from '../features/user/CurrentUserContext';
import type { CurrentUser } from '../features/user/userTypes';

interface AppRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  currentUser?: CurrentUser;
}

export function renderApp(ui: ReactElement, { route = '/', currentUser, ...options }: AppRenderOptions = {}) {
  const content = currentUser ? (
    <CurrentUserStateProvider state={{ status: 'success', data: currentUser, refetch: () => undefined }}>
      {ui}
    </CurrentUserStateProvider>
  ) : ui;

  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
    </MantineProvider>,
    options,
  );
}

export * from '@testing-library/react';
