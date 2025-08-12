// Utalk-frontend/src/lib/utils/time.ts
export function toDateSafe(input: any): string | null {
  if (!input) return null;
  if (typeof input === 'object' && typeof input._seconds === 'number') {
    return new Date(input._seconds * 1000).toISOString();
  }
  const d = new Date(input);
  return isNaN(+d) ? null : d.toISOString();
} 