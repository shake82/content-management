import { beforeEach, expect, it, vi } from 'vitest';
import { parsedSecretFixture } from '../features/tools/localCertViewer/localCertViewerTestFixture';
import { postJson } from './apiClient';
import { parseSecret, PARSE_SECRET_ENDPOINT } from './toolsApi';

vi.mock('./apiClient', () => ({ postJson: vi.fn() }));

beforeEach(() => vi.mocked(postJson).mockReset());

it('posts secret content and normalizes missing response collections', async () => {
  vi.mocked(postJson).mockResolvedValueOnce(parsedSecretFixture).mockResolvedValueOnce({ type: 'PEM' });
  const request = { content: 'encoded-content', sourceType: 'file' as const, fileName: 'store.jks' };

  expect(await parseSecret(request)).toEqual(parsedSecretFixture);
  expect(postJson).toHaveBeenCalledWith(PARSE_SECRET_ENDPOINT, request);
  expect(await parseSecret({ content: 'pem', sourceType: 'text' })).toEqual({
    type: 'PEM', issueSeveritySummary: {}, keyEntries: [],
  });
});
