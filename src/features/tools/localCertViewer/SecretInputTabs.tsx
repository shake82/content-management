import { Tabs } from '@mantine/core';
import { IconFileUpload, IconTextScan2 } from '@tabler/icons-react';
import { FileSecretInput } from './FileSecretInput';
import { TextSecretInput } from './TextSecretInput';

interface SecretInputTabsProps {
  disabled?: boolean;
  loading?: boolean;
  onFileSubmit: (file: File) => void;
  onTextSubmit: (content: string) => void;
}

export function SecretInputTabs({ disabled, loading, onFileSubmit, onTextSubmit }: SecretInputTabsProps) {
  return (
    <Tabs defaultValue="file" keepMounted>
      <Tabs.List>
        <Tabs.Tab value="file" leftSection={<IconFileUpload size={16} />}>Upload file</Tabs.Tab>
        <Tabs.Tab value="text" leftSection={<IconTextScan2 size={16} />}>Paste secret</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="file" pt="lg">
        <FileSecretInput disabled={disabled} onSubmit={onFileSubmit} />
      </Tabs.Panel>
      <Tabs.Panel value="text" pt="lg">
        <TextSecretInput disabled={disabled} loading={loading} onSubmit={onTextSubmit} />
      </Tabs.Panel>
    </Tabs>
  );
}
