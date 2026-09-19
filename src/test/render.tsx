import { MantineProvider } from '@mantine/core';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { theme } from '../app/theme';

interface AppRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export function renderApp(ui: ReactElement, { route = '/', ...options }: AppRenderOptions = {}) {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MantineProvider>,
    options,
  );
}

export * from '@testing-library/react';
