import { Anchor, Box, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { routes, vaultPathRoute } from '../../app/routes';
import { StatusView } from '../../components/StatusView';
import { useVaultCatalog } from './useVaultCatalog';

export function KeystoreDetailsPage() {
  const { catalogId } = useParams();
  const { status, data, error, refetch } = useVaultCatalog();
  const item = data?.find((entry) => entry.catalogId === Number(catalogId));

  if (status === 'idle' || status === 'loading') return <StatusView kind="loading" message="Loading keystore..." />;
  if (status === 'error') return <StatusView kind="error" message={error?.message} onRetry={refetch} />;

  const pathSegments = item ? [item.secretEngine, ...item.path.split('/').filter(Boolean)] : [];

  return (
    <Box maw={1200} mx="auto">
      <Stack gap="md">
        <Breadcrumbs component="nav" separator="/" aria-label="Keystore path">
          <Anchor component={Link} to={routes.vault}>Vault View</Anchor>
          {pathSegments.map((segment, index) => {
            const ancestorPath = pathSegments.slice(0, index + 1).join('/');
            return (
              <Anchor component={Link} to={vaultPathRoute(ancestorPath)} key={ancestorPath}>
                {segment}
              </Anchor>
            );
          })}
          <Text size="sm" fw={600} c="dark" aria-current="page">
            {item?.property ?? 'Keystore not found'}
          </Text>
        </Breadcrumbs>
        <div>
          <Text className="page-eyebrow">Key store record</Text>
          <Title order={1} size="h2">Keystore Details</Title>
        </div>
      </Stack>
    </Box>
  );
}
