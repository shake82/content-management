import { Button, Menu, Stack } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { routes } from '../app/routes';

interface NavMenuProps {
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

const directLinks = [
  { label: 'Vault View', to: routes.vault },
  { label: 'Reports', to: routes.reports },
  { label: 'Settings', to: routes.settings },
];

export function NavMenu({ orientation = 'horizontal', onNavigate }: NavMenuProps) {
  const { pathname } = useLocation();
  const vertical = orientation === 'vertical';
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const linkButtons = directLinks.slice(0, 2).map((item) => (
    <Button
      component={Link}
      to={item.to}
      key={item.to}
      variant={isActive(item.to) ? 'light' : 'subtle'}
      color={isActive(item.to) ? 'teal' : 'gray'}
      className="nav-button"
      onClick={onNavigate}
      fullWidth={vertical}
      justify={vertical ? 'flex-start' : 'center'}
    >
      {item.label}
    </Button>
  ));

  const settings = directLinks[2];
  return (
    <Stack gap={4} className={vertical ? undefined : 'nav-menu-horizontal'}>
      {linkButtons}
      <Menu position="bottom-start" withinPortal transitionProps={{ duration: 0 }}>
        <Menu.Target>
          <Button
            variant={pathname.startsWith('/tools') ? 'light' : 'subtle'}
            color={pathname.startsWith('/tools') ? 'teal' : 'gray'}
            rightSection={<IconChevronDown size={14} />}
            className="nav-button"
            fullWidth={vertical}
            justify={vertical ? 'space-between' : 'center'}
          >
            Tools
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Certificate tools</Menu.Label>
          <Menu.Item
            component={Link}
            to={routes.toolsImport}
            onClick={onNavigate}
            color={isActive(routes.toolsImport) ? 'teal' : undefined}
            data-active={isActive(routes.toolsImport) || undefined}
            className={isActive(routes.toolsImport) ? 'nav-submenu-active' : undefined}
            aria-current={isActive(routes.toolsImport) ? 'page' : undefined}
          >
            Import certificates
          </Menu.Item>
          <Menu.Item
            component={Link}
            to={routes.toolsAudit}
            onClick={onNavigate}
            color={isActive(routes.toolsAudit) ? 'teal' : undefined}
            data-active={isActive(routes.toolsAudit) || undefined}
            className={isActive(routes.toolsAudit) ? 'nav-submenu-active' : undefined}
            aria-current={isActive(routes.toolsAudit) ? 'page' : undefined}
          >
            Audit history
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Button
        component={Link}
        to={settings.to}
        variant={isActive(settings.to) ? 'light' : 'subtle'}
        color={isActive(settings.to) ? 'teal' : 'gray'}
        className="nav-button"
        onClick={onNavigate}
        fullWidth={vertical}
        justify={vertical ? 'flex-start' : 'center'}
      >
        {settings.label}
      </Button>
    </Stack>
  );
}
