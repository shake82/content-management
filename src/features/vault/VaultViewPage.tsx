import { Box, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes, vaultPathRoute } from '../../app/routes';
import { StatusView } from '../../components/StatusView';
import { buildVaultTree } from './buildVaultTree';
import { VaultBreadcrumbs } from './VaultBreadcrumbs';
import { VaultFilter } from './VaultFilter';
import { VaultItemsTable } from './VaultItemsTable';
import { VaultSummaryBadges } from './VaultSummaryBadges';
import { VaultTable } from './VaultTable';
import { useVaultCatalog } from './useVaultCatalog';
import { getNodeByPath, getVisibleFolders } from './vaultSelectors';

export function VaultViewPage() {
  const { status, data, error, refetch } = useVaultCatalog();
  const navigateTo = useNavigate();
  const { '*': routePath = '' } = useParams();
  const path = routePath.replace(/^\/+|\/+$/g, '');
  const [filter, setFilter] = useState('');
  const tree = useMemo(() => data ? buildVaultTree(data) : undefined, [data]);
  const node = tree ? getNodeByPath(tree, path) : undefined;
  const folders = node ? getVisibleFolders(node, filter) : [];
  const filteredItems = (node?.items ?? []).filter((item) => {
    const query = filter.trim().toLocaleLowerCase();
    if (!query) return true;
    return [item.catalogId, item.property, item.type, item.secretEngine]
      .join(' ').toLocaleLowerCase().includes(query);
  });

  useEffect(() => {
    if (tree && !node) navigateTo(routes.vault, { replace: true });
  }, [tree, node, navigateTo]);

  useEffect(() => {
    setFilter('');
  }, [path]);

  const navigate = (nextPath: string) => navigateTo(vaultPathRoute(nextPath));

  if (status === 'idle' || status === 'loading') return <StatusView kind="loading" />;
  if (status === 'error') return <StatusView kind="error" message={error?.message} onRetry={refetch} />;
  if (!tree || !node) return <StatusView kind="empty" message="The vault catalog is empty." />;

  const noMatches = folders.length === 0 && filteredItems.length === 0;
  return (
    <Box mx="auto">
      <Group justify="space-between" align="flex-end" mb="lg" className="page-heading">
        <div>
          <Text className="page-eyebrow">Certificate inventory</Text>
          <Title order={1} size="h2">Vault View</Title>
          <Text c="dimmed" size="sm" mt={4}>Browse key stores and certificate health by secret path.</Text>
        </div>
        <VaultFilter value={filter} onChange={setFilter} />
      </Group>

      <Stack gap="lg">
        <VaultBreadcrumbs path={path} />
        <VaultSummaryBadges summary={node.aggregate} />
        {folders.length > 0 && (
          <section aria-labelledby="folder-heading">
            <Group justify="space-between" mb="xs">
              <Title id="folder-heading" order={2} size="h4">Folders</Title>
              <Text size="sm" c="dimmed">{folders.length} visible</Text>
            </Group>
            <Divider />
            <VaultTable folders={folders} onOpen={navigate} />
          </section>
        )}

        {filteredItems.length > 0 && (
          <section aria-labelledby="record-heading">
            <Group justify="space-between" mb="xs">
              <Title id="record-heading" order={2} size="h4">Key store records</Title>
              <Text size="sm" c="dimmed">{filteredItems.length} visible</Text>
            </Group>
            <Divider />
            <VaultItemsTable items={filteredItems} />
          </section>
        )}
        {filter && noMatches && <StatusView kind="empty" message={`No results match “${filter}”.`} />}
      </Stack>
    </Box>
  );
}
