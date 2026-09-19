import { Box, Burger, Group, Text, ThemeIcon } from '@mantine/core';
import { IconLockSquareRounded } from '@tabler/icons-react';
import { CurrentUser } from '../features/user/CurrentUser';
import { NavMenu } from './NavMenu';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  mobileOpened: boolean;
  onMobileToggle: () => void;
}

export function AppHeader({ mobileOpened, onMobileToggle }: AppHeaderProps) {
  return (
    <Group h="100%" px={{ base: 'md', sm: 'lg' }} justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <Burger
          opened={mobileOpened}
          onClick={onMobileToggle}
          hiddenFrom="md"
          color="white"
          size="sm"
          aria-label="Toggle navigation"
        />
        <ThemeIcon size={34} color="blue" variant="filled" radius="sm">
          <IconLockSquareRounded size={22} stroke={1.8} />
        </ThemeIcon>
        <Box>
          <Text fw={700} c="white" lh={1.1}>Secret Browser</Text>
          <Text size="xs" c="gray.5">Vault certificate inventory</Text>
        </Box>
      </Group>
      <Box visibleFrom="md" className="header-nav"><NavMenu /></Box>
      <Group gap="sm" wrap="nowrap">
        <ThemeToggle />
        <CurrentUser />
      </Group>
    </Group>
  );
}
