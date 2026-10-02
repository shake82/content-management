import { Anchor, Breadcrumbs } from '@mantine/core';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';

export function StagingCertificateBreadcrumbs({ certificateKey }: { certificateKey: string }) {
  return (
    <Breadcrumbs component="nav" separator="/" aria-label="Staging certificate path">
      <Anchor component={Link} to={routes.stagingCertificates}>
        Staging Certificates
      </Anchor>
      <Anchor component="span" c="var(--mantine-color-text)" fw={600} aria-current="page">
        {certificateKey}
      </Anchor>
    </Breadcrumbs>
  );
}
