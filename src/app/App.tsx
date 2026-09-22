import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from '../components/AppLayout';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import { DummyPage } from '../features/dummy/DummyPage';
import { CertificateViewPage } from '../features/certificates/CertificateViewPage';
import { KeystoreDetailsPage } from '../features/vault/KeystoreDetailsPage';
import { VaultViewPage } from '../features/vault/VaultViewPage';
import { LocalCertViewerPage } from '../features/tools/localCertViewer/LocalCertViewerPage';
import { CertificateRequestGeneratorPage } from '../features/tools/certificateRequestGenerator/CertificateRequestGeneratorPage';
import { CurrentUserProvider } from '../features/user/CurrentUserContext';
import { RequirePermission } from '../features/user/RequirePermission';
import { permissions } from './navigation';
import { routes } from './routes';

function protectedPage(permission: string, page: ReactNode) {
  return <RequirePermission permission={permission}>{page}</RequirePermission>;
}

function routePage(page: ReactNode) {
  return <RouteErrorBoundary>{page}</RouteErrorBoundary>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={routes.vault} replace />} />
        <Route path={routes.vaultKeystore} element={routePage(<KeystoreDetailsPage />)} />
        <Route path={`${routes.vault}/*`} element={routePage(<VaultViewPage />)} />
        <Route path={routes.certificates} element={routePage(<CertificateViewPage />)} />
        <Route path={routes.reports} element={routePage(protectedPage(permissions.viewReports, <DummyPage title="Reports" description="Certificate inventory reporting will appear here." />))} />
        <Route path={routes.toolsImport} element={routePage(<DummyPage title="Import certificates" description="Certificate import workflows will appear here." />)} />
        <Route path={routes.toolsAudit} element={routePage(<DummyPage title="Audit history" description="Vault catalog audit history will appear here." />)} />
        <Route path={routes.toolsLocalCertViewer} element={routePage(<LocalCertViewerPage />)} />
        <Route path={routes.toolsCertificateRequestGenerator} element={routePage(<CertificateRequestGeneratorPage />)} />
        <Route path={routes.settings} element={routePage(<DummyPage title="Settings" description="Secret Browser preferences will appear here." />)} />
        <Route path="*" element={<Navigate to={routes.vault} replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return <CurrentUserProvider><AppRoutes /></CurrentUserProvider>;
}
