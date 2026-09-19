import { Avatar, Group, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCurrentUser } from './useCurrentUser';

export function CurrentUser() {
  const { status, data, error } = useCurrentUser();

  if (status === 'idle' || status === 'loading') {
    return <Skeleton aria-label="Loading current user" height={34} width={132} radius="sm" />;
  }

  if (status === 'error' || !data) {
    return (
      <Tooltip label={error?.message ?? 'User information unavailable'}>
        <Group gap={6} c="red.4"><IconAlertCircle size={18} /><Text size="sm">Unavailable</Text></Group>
      </Tooltip>
    );
  }

  const initials = data.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return (
    <Group gap="sm" wrap="nowrap">
      <Avatar color="blue" size={34} radius="xl">{initials}</Avatar>
      <Stack gap={0} className="current-user-copy">
        <Text size="sm" fw={600} c="white" lineClamp={1}>{data.displayName}</Text>
        <Text size="xs" c="gray.5" lineClamp={1}>{data.roles[0]}</Text>
      </Stack>
    </Group>
  );
}
