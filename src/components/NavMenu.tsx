import { Button, Menu, Stack } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import {
  canAccess,
  directNavigationItems,
  settingsNavigationItem,
  toolNavigationItems,
  type NavigationItem,
} from '../app/navigation';
import { useCurrentUser } from '../features/user/useCurrentUser';

interface NavMenuProps {
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

export function NavMenu({ orientation = 'horizontal', onNavigate }: NavMenuProps) {
  const { pathname } = useLocation();
  const { data: currentUser } = useCurrentUser();
  const vertical = orientation === 'vertical';
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isVisible = (item: NavigationItem) => !item.permission || (currentUser && canAccess(currentUser, item.permission));
  const directLinks = directNavigationItems.filter(isVisible);
  const toolLinks = toolNavigationItems.filter(isVisible);

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
      {toolLinks.length > 0 && (
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
            {toolLinks.map((item) => (
              <Menu.Item
                component={Link}
                to={item.to}
                key={item.to}
                onClick={onNavigate}
                color={isActive(item.to) ? 'blue' : undefined}
                data-active={isActive(item.to) || undefined}
                className={isActive(item.to) ? 'nav-submenu-active' : undefined}
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
      {isVisible(settingsNavigationItem) && (
        <Button
          component={Link}
          to={settingsNavigationItem.to}
          variant={isActive(settingsNavigationItem.to) ? 'light' : 'subtle'}
          color={isActive(settingsNavigationItem.to) ? 'blue' : 'gray'}
          className="nav-button"
          onClick={onNavigate}
          fullWidth={vertical}
          justify={vertical ? 'flex-start' : 'center'}
        >
          {settingsNavigationItem.label}
        </Button>
      )}
    </Stack>
  );
}
