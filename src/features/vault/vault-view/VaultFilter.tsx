import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface VaultFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function VaultFilter({ value, onChange }: VaultFilterProps) {
  return (
    <TextInput
      aria-label="Filter folders and records"
      placeholder="Filter this level"
      leftSection={<IconSearch size={17} />}
      rightSection={value ? (
        <Tooltip label="Clear filter">
          <ActionIcon variant="subtle" color="gray" aria-label="Clear filter" onClick={() => onChange('')}>
            <IconX size={16} />
          </ActionIcon>
        </Tooltip>
      ) : undefined}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="vault-filter"
    />
  );
}
