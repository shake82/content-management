import { expect, it } from 'vitest';
import {
  decodeStagingCertificatePath,
  encodeStagingCertificatePath,
  stagingCertificateDetailRoute,
} from './routes';

it('builds staging detail routes with segment encoding and decodes route splats', () => {
  expect(stagingCertificateDetailRoute('apps/prod/payments')).toBe('/staging/apps/prod/payments');
  expect(stagingCertificateDetailRoute('apps/prod/payment api')).toBe('/staging/apps/prod/payment%20api');
  expect(encodeStagingCertificatePath('apps/prod/payment api')).toBe('apps/prod/payment%20api');
  expect(decodeStagingCertificatePath('apps/prod/payment%20api')).toBe('apps/prod/payment api');
});
