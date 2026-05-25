export function safeJson<T = unknown>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}

export function serializeProduct(p: Record<string, unknown>) {
  return {
    ...p,
    images: safeJson<string[]>(p.images as string, []),
    variants: safeJson(p.variants as string, []),
    tags: safeJson<string[]>(p.tags as string, []),
    nutrition: safeJson(p.nutrition as string, {}),
  }
}
