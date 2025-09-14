export function nowMs(): number {
  if (typeof performance !== "undefined" && performance.now)
    return performance.now();
  return Date.now();
}

export function measure<T>(fn: () => T): { value: T; ms: number } {
  const start = nowMs();
  const value = fn();
  const end = nowMs();
  return { value, ms: Math.max(0, end - start) };
}
