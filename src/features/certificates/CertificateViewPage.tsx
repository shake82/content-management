import { ActionIcon, Box, Divider, Group, Pagination, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { StatusView } from '../../components/StatusView';
import { CertificateCatalogTable } from './CertificateCatalogTable';
import { useCertificateCatalog } from './useCertificateCatalog';

const PAGE_SIZE = 15;

export function CertificateViewPage() {
  const [pageNumber, setPageNumber] = useState(0);
  const [search, setSearch] = useState('');
  const { status, data, error, refetch } = useCertificateCatalog(pageNumber, PAGE_SIZE, search);

  const updateSearch = (value: string) => {
    setSearch(value);
    setPageNumber(0);
  };

  const content = data?.content ?? [];
  const noResults = status === 'success' && content.length === 0;

  return (
    <Box mx="auto">
      <Group justify="space-between" align="flex-end" mb="lg" className="page-heading">
        <div>
          <Text className="page-eyebrow">Certificate inventory</Text>
          <Title order={1} size="h2">Certificate View</Title>
          <Text c="dimmed" size="sm" mt={4}>Review certificate health and locate every keystore reference.</Text>
        </div>
        <TextInput
          className="certificate-view-search"
          aria-label="Search certificates"
          placeholder="Search certificates"
          leftSection={<IconSearch size={16} />}
          rightSection={search ? (
            <Tooltip label="Clear search">
              <ActionIcon variant="subtle" color="gray" aria-label="Clear search" onClick={() => updateSearch('')}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          ) : undefined}
          value={search}
          onChange={(event) => updateSearch(event.currentTarget.value)}
        />
      </Group>

      <section aria-labelledby="certificate-heading">
        <Group justify="space-between" mb="xs">
          <Title id="certificate-heading" order={2} size="h4">Certificates</Title>
          {data && <Text size="sm" c="dimmed">{data.totalElements} total</Text>}
        </Group>
        <Divider />
        {status === 'idle' || status === 'loading' ? <StatusView kind="loading" message="Loading certificates..." /> : null}
        {status === 'error' ? <StatusView kind="error" message={error?.message} onRetry={refetch} /> : null}
        {noResults ? (
          <StatusView
            kind="empty"
            message={search.trim() ? `No certificates match “${search.trim()}”.` : 'The certificate catalog is empty.'}
          />
        ) : null}
        {status === 'success' && content.length > 0 ? (
          <Stack gap="md">
            <CertificateCatalogTable items={content} />
            <Group justify="space-between" className="certificate-view-pagination">
              <Text size="sm" c="dimmed">
                Page {data!.number + 1} of {data!.totalPages}
              </Text>
              <Pagination
                aria-label="Certificate catalog pages"
                value={pageNumber + 1}
                total={Math.max(data!.totalPages, 1)}
                onChange={(page) => setPageNumber(page - 1)}
              />
            </Group>
          </Stack>
        ) : null}
      </section>
    </Box>
  );
}
