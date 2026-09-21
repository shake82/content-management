import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { renderApp } from '../../test/render';
import type { KeystoreComparison, KeystoreDetails } from './detailTypes';
import { KeystoreDetailsPage } from './KeystoreDetailsPage';
import { useKeystoreComparison } from './useKeystoreComparison';
import { useKeystoreDetails } from './useKeystoreDetails';

vi.mock('./useKeystoreDetails', () => ({ useKeystoreDetails: vi.fn() }));
vi.mock('./useKeystoreComparison', () => ({ useKeystoreComparison: vi.fn() }));

const detailsFixture: KeystoreDetails = {
  version: 17,
  secretMetadata: {
    type: 'JKS',
    keyEntries: [
      {
      alias: 'cert1',
      entryType: 'TRUST_CERT',
      certificates: [
        {
          shortName: 'Cert1',
          startDate: '2025-05-28T00:00:000Z',
          endDate: '2027-05-28T00:00:000Z',
          revocationDate: null,
          version: 3,
          subject: 'CN=ASDF,C=US',
          issuer: 'CN=ASDF,C=US',
          hexSerialNumber: '0x01',
          fingerpring: '123456',
        },
      ],
      expirationDate: '2027-05-28T00:00:000Z',
      issues: [],
      lastModifiedDate: '2025-05-28T00:00:000Z',
      },
      {
      alias: 'kp1',
      entryType: 'KEY_PAIR',
      certificates: [
        {
          shortName: 'Root',
          startDate: '2025-05-28T00:00:000Z',
          endDate: '2000-01-28T00:00:000Z',
          revocationDate: '2025-06-01T00:00:000Z',
          version: 3,
          subject: 'CN=ROOT,C=US',
          issuer: 'CN=ROOT,C=US',
          hexSerialNumber: '0x02',
          fingerpring: 'root-fingerprint',
        },
        {
          shortName: 'Leaf',
          startDate: '2025-05-28T00:00:000Z',
          endDate: '2026-01-28T00:00:000Z',
          revocationDate: null,
          version: 3,
          subject: 'CN=LEAF,C=US',
          issuer: 'CN=ROOT,C=US',
          hexSerialNumber: '0x03',
          fingerpring: 'leaf-fingerprint',
        },
      ],
      expirationDate: '2026-01-28T00:00:000Z',
      issues: [
        { type: 'EXPIRING_CERTIFICATE', severity: 'MEDIUM' },
        { type: 'EXPIRED_CERTIFICATE', severity: 'HIGH' },
      ],
      lastModifiedDate: '2025-05-28T00:00:000Z',
      },
      {
      alias: 'cert-warning',
      entryType: 'TRUST_CERT',
      certificates: null,
      expirationDate: '2027-01-28T00:00:000Z',
      issues: [{ type: 'EXPIRING_CERTIFICATE', severity: 'MEDIUM' }],
      lastModifiedDate: '2025-05-28T00:00:000Z',
      },
    ],
  },
  versions: [
    { createdDate: '2024-01-01T00:00:00', version: 15 },
    { createdDate: '2024-01-01T00:00:00', version: 16 },
    { createdDate: '2025-01-01T00:00:00', version: 17 },
  ],
};

const comparisonFixture: KeystoreComparison = {
  keyEntries: [
    {
      alias: 'cert1',
      comparisonResult: 'CERTIFICATE_MISMATCH',
      sourceKeyEntry: detailsFixture.secretMetadata.keyEntries[0]!,
      targetKeyEntry: {
        ...detailsFixture.secretMetadata.keyEntries[0]!,
        certificates: [{
          ...detailsFixture.secretMetadata.keyEntries[0]!.certificates![0]!,
          shortName: 'Historical Cert1',
          fingerpring: 'historical-fingerprint',
        }],
        issues: [{ type: 'EXPIRING_CERTIFICATE', severity: 'HIGH' }],
      },
    },
  ],
};

beforeEach(() => {
  vi.mocked(useKeystoreDetails).mockReturnValue({
    status: 'success', data: detailsFixture, refetch: vi.fn(),
  });
  vi.mocked(useKeystoreComparison).mockReturnValue({
    status: 'success', data: comparisonFixture, refetch: vi.fn(),
  });
});

it('renders the detail title and effective-path breadcrumbs', () => {
  renderApp(
    <Routes><Route path="/vault/keystore" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store' },
  );

  expect(screen.getByRole('heading', { name: 'Keystore Details' })).toBeInTheDocument();
  expect(useKeystoreDetails).toHaveBeenCalledWith({
    engine: 'engine-a',
    path: 'apps/prod/payments',
    prop: 'store',
  });
  expect(screen.getByRole('navigation', { name: 'Keystore path' })).toHaveTextContent('Vault View/engine-a/apps/prod/payments/store');
  expect(screen.getByRole('link', { name: 'Vault View' })).toHaveAttribute('href', '/vault');
  expect(screen.getByRole('link', { name: 'engine-a' })).toHaveAttribute('href', '/vault/engine-a');
  expect(screen.getByRole('link', { name: 'apps' })).toHaveAttribute('href', '/vault/engine-a/apps');
  expect(screen.getByRole('link', { name: 'payments' })).toHaveAttribute('href', '/vault/engine-a/apps/prod/payments');
  expect(screen.getByText('store')).toHaveAttribute('aria-current', 'page');
});

it('shows the highest issue severity and lists each issue on a separate tooltip line', async () => {
  renderApp(
    <Routes><Route path="/vault/keystore" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store' },
  );

  expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Is Valid' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Expiration' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Last Modified' })).toBeInTheDocument();
  expect(screen.getAllByText('TRUST_CERT')).toHaveLength(2);
  expect(screen.getByText('KEY_PAIR')).toBeInTheDocument();
  expect(screen.getByText('cert1')).toBeInTheDocument();
  expect(screen.getByText('kp1')).toBeInTheDocument();

  expect(screen.getByText('HIGH').closest('[data-severity]')).toHaveAttribute('data-severity', 'HIGH');
  expect(screen.getByText('MEDIUM').closest('[data-severity]')).toHaveAttribute('data-severity', 'MEDIUM');
  await userEvent.hover(screen.getByText('HIGH'));
  expect(await screen.findByText('MEDIUM: ExpiringCertificate')).toBeInTheDocument();
  expect(await screen.findByText('HIGH: ExpiredCertificate')).toBeInTheDocument();
});

it('searches key entries by certificate name, serial number, and subject', async () => {
  renderApp(
    <Routes><Route path="/vault/keystore" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store' },
  );

  const search = screen.getByRole('textbox', { name: 'Search key entries' });

  await userEvent.type(search, 'Leaf');
  expect(screen.getByText('kp1')).toBeInTheDocument();
  expect(screen.queryByText('cert1')).not.toBeInTheDocument();

  await userEvent.clear(search);
  await userEvent.type(search, '0x01');
  expect(screen.getByText('cert1')).toBeInTheDocument();
  expect(screen.queryByText('kp1')).not.toBeInTheDocument();

  await userEvent.clear(search);
  await userEvent.type(search, 'CN=ROOT');
  expect(screen.getByText('kp1')).toBeInTheDocument();
  expect(screen.queryByText('cert1')).not.toBeInTheDocument();
  expect(screen.getByText('1 of 3 entries')).toBeInTheDocument();
});

it('filters key entries by issue presence and high severity', async () => {
  renderApp(
    <Routes><Route path="/vault/keystore" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store' },
  );

  await userEvent.click(screen.getByText('With issues'));
  expect(screen.queryByText('cert1')).not.toBeInTheDocument();
  expect(screen.getByText('kp1')).toBeInTheDocument();
  expect(screen.getByText('cert-warning')).toBeInTheDocument();
  expect(screen.getByText('2 of 3 entries')).toBeInTheDocument();

  await userEvent.click(screen.getByText('High severity'));
  expect(screen.getByText('kp1')).toBeInTheDocument();
  expect(screen.queryByText('cert-warning')).not.toBeInTheDocument();
  expect(screen.getByText('1 of 3 entries')).toBeInTheDocument();

  await userEvent.click(screen.getByText('Show all'));
  expect(screen.getByText('cert1')).toBeInTheDocument();
  expect(screen.getByText('cert-warning')).toBeInTheDocument();
});

it('keeps multiple entries expanded and opens certificate details', async () => {
  renderApp(
    <Routes><Route path="/vault/keystore" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store' },
  );

  await userEvent.click(screen.getByRole('button', { name: 'Expand cert1' }));
  await userEvent.click(screen.getByRole('button', { name: 'Expand kp1' }));
  expect(screen.getByRole('button', { name: 'Collapse cert1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Collapse kp1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cert1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Root' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Leaf' })).toBeInTheDocument();
  expect(screen.getAllByText('Expired').length).toBeGreaterThan(0);
  expect(screen.getByText('Revoked')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Leaf' }));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent('Leaf');
  expect(within(dialog).getByText('CN=LEAF,C=US')).toBeInTheDocument();
  expect(within(dialog).getByText('CN=ROOT,C=US')).toBeInTheDocument();
  expect(within(dialog).getByText('leaf-fingerprint')).toBeInTheDocument();
});

it('selects a historical version and renders side-by-side comparison trees', async () => {
  renderApp(
    <Routes><Route path="/vault/keystore" element={<KeystoreDetailsPage />} /></Routes>,
    { route: '/vault/keystore?engine=engine-a&path=apps%2Fprod%2Fpayments&prop=store' },
  );

  const versionSelect = screen.getByRole('combobox', { name: 'Compare version' });
  expect(versionSelect).toHaveValue('Version 17 (Current)');
  expect(screen.getByText('Version 16 - Jan 1, 2024')).toBeInTheDocument();
  await userEvent.click(versionSelect);
  await userEvent.keyboard('{ArrowDown}{Enter}');

  expect(useKeystoreComparison).toHaveBeenCalledWith(
    { engine: 'engine-a', path: 'apps/prod/payments', prop: 'store' },
    17,
    16,
  );
  expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Comparison Result' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Is Current Valid' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Is Version 16 Valid' })).toBeInTheDocument();
  expect(screen.getByText('Certificate mismatch')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Expand cert1' }));
  expect(screen.getByText('Current version 17')).toBeInTheDocument();
  expect(screen.getByText('Version 16')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cert1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Historical Cert1' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Historical Cert1' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent('historical-fingerprint');
});
