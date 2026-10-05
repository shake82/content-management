import { expect, it } from 'vitest';
import { runWithConcurrencyLimit } from './stagingCertificateConcurrency';

it('limits active workers and preserves per-item success and failure results', async () => {
  let active = 0;
  let maxActive = 0;
  const results = await runWithConcurrencyLimit([1, 2, 3, 4, 5], 3, async (input) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 1));
    active -= 1;
    if (input === 4) throw new Error('No status');
    return input * 2;
  });

  expect(maxActive).toBeLessThanOrEqual(3);
  expect(results.map((result) => result.input)).toEqual([1, 2, 3, 4, 5]);
  expect(results.map((result) => result.result)).toEqual([2, 4, 6, undefined, 10]);
  expect(results[3].error?.message).toBe('No status');
});
