export interface ConcurrencyResult<TInput, TOutput> {
  input: TInput;
  result?: TOutput;
  error?: Error;
}

export async function runWithConcurrencyLimit<TInput, TOutput>(
  inputs: TInput[],
  limit: number,
  worker: (input: TInput) => Promise<TOutput>,
): Promise<Array<ConcurrencyResult<TInput, TOutput>>> {
  const results: Array<ConcurrencyResult<TInput, TOutput>> = [];
  const safeLimit = Math.max(1, limit);
  let nextIndex = 0;

  // A fixed number of workers drains the shared index, preserving input order in results.
  async function runNext(): Promise<void> {
    const index = nextIndex;
    nextIndex += 1;
    const input = inputs[index];
    if (input === undefined) return;

    try {
      results[index] = { input, result: await worker(input) };
    } catch (reason: unknown) {
      results[index] = {
        input,
        error: reason instanceof Error ? reason : new Error('Unexpected API error'),
      };
    }

    await runNext();
  }

  await Promise.all(
    Array.from({ length: Math.min(safeLimit, inputs.length) }, () => runNext()),
  );

  return results;
}
