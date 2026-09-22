import { beforeEach, expect, it, vi } from 'vitest';
import { parsedSecretFixture } from '../features/tools/localCertViewer/localCertViewerTestFixture';
import { postFormData, postJson } from './apiClient';
import {
  generateCertificateRequest,
  GENERATE_CERTIFICATE_REQUEST_ENDPOINT,
  parseSecret,
  PARSE_SECRET_ENDPOINT,
} from './toolsApi';

vi.mock('./apiClient', () => ({ postFormData: vi.fn(), postJson: vi.fn() }));

beforeEach(() => {
  vi.mocked(postFormData).mockReset();
  vi.mocked(postJson).mockReset();
});

it('posts secret files as multipart form data and normalizes missing response collections', async () => {
  vi.mocked(postFormData).mockResolvedValueOnce(parsedSecretFixture).mockResolvedValueOnce({ type: 'PEM' });
  const file = new File(['encoded-content'], 'store.jks');

  expect(await parseSecret({ file, sourceType: 'file' })).toEqual(parsedSecretFixture);
  expect(postFormData).toHaveBeenCalledWith(PARSE_SECRET_ENDPOINT, expect.any(FormData), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  expect((vi.mocked(postFormData).mock.calls[0]?.[1] as FormData).get('file')).toBe(file);
  expect(await parseSecret({ content: 'pem', sourceType: 'text' })).toEqual({
    type: 'PEM', issueSeveritySummary: {}, keyEntries: [],
  });
  const textFile = (vi.mocked(postFormData).mock.calls[1]?.[1] as FormData).get('file') as File;
  expect(textFile.name).toBe('secret.txt');
  expect(await textFile.text()).toBe('pem');
});

it('posts normalized certificate request data to the generator endpoint', async () => {
  const request = { subject: 'CN=service.example.gov,C=US', alternateSubjects: ['api.example.gov'] };
  const response = { privateKey: 'FAKE-PRIVATE-PEM', certificateRequest: 'FAKE-CSR-PEM' };
  vi.mocked(postJson).mockResolvedValue(response);

  expect(await generateCertificateRequest(request)).toEqual(response);
  expect(postJson).toHaveBeenCalledWith(GENERATE_CERTIFICATE_REQUEST_ENDPOINT, request);
});
