import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

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
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="vault-filter"
    />
  );
}
