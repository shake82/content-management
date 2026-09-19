const DEFAULT_DELAY_MS = 180;

export async function mockGet<T>(path: string, payload: T): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, DEFAULT_DELAY_MS));

  if (!path.startsWith('/api/')) {
    throw new Error(`Unsupported API path: ${path}`);
  }

  return structuredClone(payload);
}
