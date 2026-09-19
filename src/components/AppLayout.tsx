import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { NavMenu } from './NavMenu';

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure(false);
  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{ width: 260, breakpoint: 'md', collapsed: { desktop: true, mobile: !opened } }}
      padding={{ base: 'md', sm: 'xl' }}
    >
      <AppShell.Header className="app-header">
        <AppHeader mobileOpened={opened} onMobileToggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar p="md"><NavMenu orientation="vertical" onNavigate={close} /></AppShell.Navbar>
      <AppShell.Main><Outlet /></AppShell.Main>
    </AppShell>
  );
}
