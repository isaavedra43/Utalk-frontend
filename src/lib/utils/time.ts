// Conversión robusta de timestamps: string | number | Date | Firestore-like
export function toDateSafe(input: string | number | Date | { _seconds?: number; _nanoseconds?: number; seconds?: number; nanoseconds?: number } | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;

  if (typeof input === 'number') {
    // Si viene en ms (convención UI)
    if (input > 1e12) return new Date(input);
    // Si llega en segundos (por si acaso)
    return new Date(input * 1000);
  }

  if (typeof input === 'string') {
    const d = new Date(input);
    return isNaN(+d) ? null : d;
  }

  // Firestore-like { _seconds, _nanoseconds } o { seconds, nanoseconds }
  const sec = input?._seconds ?? input?.seconds;
  if (typeof sec === 'number') {
    const nsec = input?._nanoseconds ?? input?.nanoseconds ?? 0;
    const ms = sec * 1000 + Math.floor(nsec / 1e6);
    return new Date(ms);
  }

  return null;
} 