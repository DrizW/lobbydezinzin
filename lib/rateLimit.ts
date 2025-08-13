// Simple in-memory rate limiter (pour la VM unique). Pour multi-instances, utiliser Redis.

type Key = string;
const store = new Map<Key, { count: number; resetAt: number }>();

export function rateLimit({ key, windowMs, max }: { key: string; windowMs: number; max: number }) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (current.count >= max) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return { allowed: true, remaining: max - current.count };
}


