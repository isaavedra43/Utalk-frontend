export type Trend = 'up' | 'down' | 'flat';

export interface UiState { loading?: boolean; error?: string | null; empty?: boolean; }

export interface Kpi {
  id: string;
  label: string;
  value: string | number;
  deltaPct?: number | null;
  trend?: Trend;
  helper?: string | null;
  icon?: string;
  tone?: 'green' | 'purple' | 'blue' | 'indigo' | 'red';
}

export interface HourlyPoint {
  hour: string;   // "12:00"
  normal: number; // altura base
  peak: number;   // barra destacada
}

export interface ActivitySummary {
  total: number;
  vsYesterdayPct: number;
  peakHour: string;
}
