import { Anchor, Breadcrumbs } from '@mantine/core';
import { Link } from 'react-router-dom';
import { vaultPathRoute } from '../../app/routes';

interface VaultBreadcrumbsProps {
  path: string;
}

export function VaultBreadcrumbs({ path }: VaultBreadcrumbsProps) {
  const segments = path.split('/').filter(Boolean);
  const crumbs = [{ label: 'Vault', path: '' }, ...segments.map((segment, index) => ({
    label: segment,
    path: segments.slice(0, index + 1).join('/'),
  }))];

  return (
    <Breadcrumbs component="nav" separator="/" aria-label="Vault path">
      {crumbs.map((crumb, index) => {
        const current = index === crumbs.length - 1;
        return (
          <Anchor
            component={Link}
            to={vaultPathRoute(crumb.path)}
            key={crumb.path || 'root'}
            c={current ? 'var(--mantine-color-text)' : 'blue'}
            fw={current ? 600 : 400}
            aria-current={current ? 'page' : undefined}
          >
            {crumb.label}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
