// Utalk-frontend/src/lib/utils/time.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDateSafe(input: any): string | null {
  if (!input) return null;

  // 1. Objetos Firestore con _seconds y _nanoseconds
  if (typeof input === 'object' && typeof input._seconds === 'number') {
    const seconds = input._seconds * 1000;
    const nanoseconds = Math.floor((input._nanoseconds || 0) / 1e6);
    const d = new Date(seconds + nanoseconds);
    return isNaN(+d) ? null : d.toISOString();
  }

  // 2. Strings y números
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input);
    return isNaN(+d) ? null : d.toISOString();
  }

  return null;
}
