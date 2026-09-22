import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconClipboard, IconDownload, IconExclamationCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { downloadTextFile } from './downloadTextFile';

interface PemActionButtonsProps {
  contents: string;
  fileName: string;
  label: string;
}

type CopyState = 'idle' | 'copied' | 'error';

export function PemActionButtons({ contents, fileName, label }: PemActionButtonsProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(contents);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  };

  return (
    <Group gap="xs" wrap="nowrap">
      <Text size="xs" c={copyState === 'error' ? 'red' : 'dimmed'} aria-live="polite">
        {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : ''}
      </Text>
      <Tooltip label={`Copy ${label}`}>
        <ActionIcon variant="subtle" aria-label={`Copy ${label}`} onClick={() => void copy()}>
          {copyState === 'copied' ? <IconCheck size={17} /> : copyState === 'error' ? <IconExclamationCircle size={17} /> : <IconClipboard size={17} />}
        </ActionIcon>
      </Tooltip>
      <Tooltip label={`Download ${label}`}>
        <ActionIcon variant="subtle" aria-label={`Download ${label}`} onClick={() => downloadTextFile(contents, fileName)}>
          <IconDownload size={17} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
