import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { DummyPage } from '../features/dummy/DummyPage';
import { CertificateViewPage } from '../features/certificates/CertificateViewPage';
import { KeystoreDetailsPage } from '../features/vault/KeystoreDetailsPage';
import { VaultViewPage } from '../features/vault/VaultViewPage';
import { LocalCertViewerPage } from '../features/tools/localCertViewer/LocalCertViewerPage';
import { routes } from './routes';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={routes.vault} replace />} />
        <Route path={routes.vaultKeystorePattern} element={<KeystoreDetailsPage />} />
        <Route path={`${routes.vault}/*`} element={<VaultViewPage />} />
        <Route path={routes.certificates} element={<CertificateViewPage />} />
        <Route path={routes.reports} element={<DummyPage title="Reports" description="Certificate inventory reporting will appear here." />} />
        <Route path={routes.toolsImport} element={<DummyPage title="Import certificates" description="Certificate import workflows will appear here." />} />
        <Route path={routes.toolsAudit} element={<DummyPage title="Audit history" description="Vault catalog audit history will appear here." />} />
        <Route path={routes.toolsLocalCertViewer} element={<LocalCertViewerPage />} />
        <Route path={routes.settings} element={<DummyPage title="Settings" description="Secret Browser preferences will appear here." />} />
        <Route path="*" element={<Navigate to={routes.vault} replace />} />
      </Route>
    </Routes>
  );
}
