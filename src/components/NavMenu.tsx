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
  { label: 'Certificate View', to: routes.certificates },
  { label: 'Reports', to: routes.reports },
];

const settings = { label: 'Settings', to: routes.settings };

export function NavMenu({ orientation = 'horizontal', onNavigate }: NavMenuProps) {
  const { pathname } = useLocation();
  const vertical = orientation === 'vertical';
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const linkButtons = directLinks.map((item) => (
    <Button
      component={Link}
      to={item.to}
      key={item.to}
      variant={isActive(item.to) ? 'light' : 'subtle'}
      color={isActive(item.to) ? 'blue' : 'gray'}
      className="nav-button"
      onClick={onNavigate}
      fullWidth={vertical}
      justify={vertical ? 'flex-start' : 'center'}
    >
      {item.label}
    </Button>
  ));

  return (
    <Stack gap={4} className={vertical ? undefined : 'nav-menu-horizontal'}>
      {linkButtons}
      <Menu position="bottom-start" withinPortal transitionProps={{ duration: 0 }}>
        <Menu.Target>
          <Button
            variant={pathname.startsWith('/tools') ? 'light' : 'subtle'}
            color={pathname.startsWith('/tools') ? 'blue' : 'gray'}
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
            to={routes.toolsLocalCertViewer}
            onClick={onNavigate}
            color={isActive(routes.toolsLocalCertViewer) ? 'blue' : undefined}
            data-active={isActive(routes.toolsLocalCertViewer) || undefined}
            className={isActive(routes.toolsLocalCertViewer) ? 'nav-submenu-active' : undefined}
            aria-current={isActive(routes.toolsLocalCertViewer) ? 'page' : undefined}
          >
            Local Cert Viewer
          </Menu.Item>
          <Menu.Item
            component={Link}
            to={routes.toolsImport}
            onClick={onNavigate}
            color={isActive(routes.toolsImport) ? 'blue' : undefined}
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
            color={isActive(routes.toolsAudit) ? 'blue' : undefined}
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
        color={isActive(settings.to) ? 'blue' : 'gray'}
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
