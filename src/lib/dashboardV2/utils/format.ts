export const fmt = {
  pct: (v: number) => `${(v ?? 0).toFixed(1)}%`,
  delta: (v: number) => (v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`),
};
