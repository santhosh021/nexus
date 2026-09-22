const store = new Map<string, { expires: number; value: unknown }>();

/** In-memory cache with a per-entry TTL. Keeps calls to free APIs well inside their rate limits. */
export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await fetcher();
  store.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}
