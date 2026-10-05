import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { RouteErrorBoundary } from '../components/feedback/RouteErrorBoundary';
import { CertificateViewPage } from '../features/certificates/CertificateViewPage';
import { KeystoreDetailsPage } from '../features/vault/keystore-detail/KeystoreDetailsPage';
import { VaultViewPage } from '../features/vault/vault-view/VaultViewPage';
import { LocalCertViewerPage } from '../features/tools/localCertViewer/LocalCertViewerPage';
import { CertificateRequestGeneratorPage } from '../features/tools/certificateRequestGenerator/CertificateRequestGeneratorPage';
import { StagingCertificateDetailPage } from '../features/stagingCertificates/staging-detail/StagingCertificateDetailPage';
import { StagingCertificatesPage } from '../features/stagingCertificates/staging-list/StagingCertificatesPage';
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
        <Route path={routes.stagingCertificates} element={routePage(protectedPage(permissions.manageStagingCertificates, <StagingCertificatesPage />))} />
        <Route path={`${routes.stagingCertificateDetail}/*`} element={routePage(protectedPage(permissions.manageStagingCertificates, <StagingCertificateDetailPage />))} />
        <Route path={routes.toolsLocalCertViewer} element={routePage(<LocalCertViewerPage />)} />
        <Route path={routes.toolsCertificateRequestGenerator} element={routePage(<CertificateRequestGeneratorPage />)} />
        <Route path="*" element={<Navigate to={routes.vault} replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return <CurrentUserProvider><AppRoutes /></CurrentUserProvider>;
}
