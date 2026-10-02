import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Pagination,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { StatusView } from '../../components/StatusView';
import {
  filterStagingCertificateKeys,
  getTotalPages,
  paginateKeys,
} from './stagingCertificateFiltering';
import { NewStagingCertificateModal } from './NewStagingCertificateModal';
import { StagingCertificatesTable } from './StagingCertificatesTable';
import { useRenderedStagingCertificateStatuses } from './useRenderedStagingCertificateStatuses';
import { useStagingCertificateKeys } from './useStagingCertificateKeys';

const PAGE_SIZE = 15;

export function StagingCertificatesPage() {
  const [filter, setFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [modalOpened, setModalOpened] = useState(false);
  const keysRequest = useStagingCertificateKeys();
  const keys = keysRequest.data ?? [];
  const filteredKeys = useMemo(() => filterStagingCertificateKeys(keys, filter), [keys, filter]);
  const totalPages = getTotalPages(filteredKeys.length, PAGE_SIZE);
  const visibleKeys = useMemo(
    () => paginateKeys(filteredKeys, pageNumber, PAGE_SIZE),
    [filteredKeys, pageNumber],
  );
  const { statuses, retryStatus } = useRenderedStagingCertificateStatuses(
    keysRequest.status === 'success' ? visibleKeys : [],
  );

  useEffect(() => {
    if (pageNumber > totalPages - 1) setPageNumber(Math.max(totalPages - 1, 0));
  }, [pageNumber, totalPages]);

  const updateFilter = (value: string) => {
    setFilter(value);
    setPageNumber(0);
  };

  const isLoading = keysRequest.status === 'idle' || keysRequest.status === 'loading';
  const isEmpty = keysRequest.status === 'success' && keys.length === 0;
  const hasNoResults = keysRequest.status === 'success' && keys.length > 0 && filteredKeys.length === 0;

  return (
    <Box mx="auto">
      <Group justify="space-between" align="flex-end" mb="lg" className="page-heading">
        <div>
          <Text className="page-eyebrow">Certificate inventory</Text>
          <Title order={1} size="h2">Staging Certificates</Title>
          <Text c="dimmed" size="sm" mt={4}>Review staging certificate readiness and workflow status.</Text>
        </div>
        <Group align="flex-end">
          <TextInput
            className="staging-certificates-filter"
            aria-label="Filter staging certificates"
            placeholder="Filter staging certificates"
            leftSection={<IconSearch size={16} />}
            rightSection={filter ? (
              <Tooltip label="Clear filter">
                <ActionIcon variant="subtle" color="gray" aria-label="Clear filter" onClick={() => updateFilter('')}>
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            ) : undefined}
            value={filter}
            onChange={(event) => updateFilter(event.currentTarget.value)}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
            New
          </Button>
        </Group>
      </Group>

      <section aria-labelledby="staging-certificates-heading">
        <Group justify="space-between" mb="xs">
          <Title id="staging-certificates-heading" order={2} size="h4">Certificates</Title>
          {keysRequest.status === 'success' && <Text size="sm" c="dimmed">{filteredKeys.length} visible</Text>}
        </Group>
        <Divider />
        {isLoading && <StatusView kind="loading" message="Loading staging certificates..." />}
        {keysRequest.status === 'error' && (
          <StatusView kind="error" message={keysRequest.error?.message} onRetry={keysRequest.refetch} />
        )}
        {isEmpty && <StatusView kind="empty" message="There are no staging certificates." />}
        {hasNoResults && (
          <StatusView kind="empty" message={`No staging certificates match "${filter.trim()}".`} />
        )}
        {keysRequest.status === 'success' && visibleKeys.length > 0 && (
          <Stack gap="md">
            <StagingCertificatesTable keys={visibleKeys} statuses={statuses} onRetryStatus={retryStatus} />
            <Group justify="space-between" className="staging-certificates-pagination">
              <Text size="sm" c="dimmed">Page {pageNumber + 1} of {totalPages}</Text>
              <Pagination
                aria-label="Staging certificate pages"
                value={pageNumber + 1}
                total={totalPages}
                onChange={(page) => setPageNumber(page - 1)}
              />
            </Group>
          </Stack>
        )}
      </section>
      <NewStagingCertificateModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </Box>
  );
}
