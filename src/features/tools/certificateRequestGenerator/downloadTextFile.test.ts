import { afterEach, expect, it, vi } from 'vitest';
import { downloadTextFile } from './downloadTextFile';

afterEach(() => vi.restoreAllMocks());

it('downloads PEM contents with an object URL and releases it', () => {
  const createObjectURL = vi.fn().mockReturnValue('blob:fake-pem');
  const revokeObjectURL = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

  downloadTextFile('FAKE-PEM', 'private.pem');

  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalledOnce();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-pem');
});
