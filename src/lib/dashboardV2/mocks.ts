import type { Kpi, HourlyPoint, ActivitySummary } from './types';

export const mockKpis: Kpi[] = [
  { id: 'sentiment', label: 'Sentimiento Global', value: '78%', deltaPct: 8.3, trend: 'up', helper: 'Anterior: 72%', tone: 'green' },
  { id: 'frt',       label: 'Tiempo Medio de Respuesta', value: '2.4 min', deltaPct: -22.6, trend: 'down', helper: 'Anterior: 3.1 min', tone: 'purple' },
  { id: 'resolved',  label: 'Conversaciones Resueltas', value: 147, deltaPct: 11.4, trend: 'up', helper: 'Anterior: 132', tone: 'blue' },
  { id: 'revenue',   label: 'Ventas desde Chats', value: '€12,450', deltaPct: 27.0, trend: 'up', helper: 'Anterior: €9,800', tone: 'indigo' },
];

export const mockHourly: HourlyPoint[] = [
  { hour: '02:00', normal: 14, peak: 0 }, { hour: '03:00', normal: 9, peak: 0 },
  { hour: '04:00', normal: 22, peak: 0 }, { hour: '05:00', normal: 31, peak: 0 },
  { hour: '06:00', normal: 48, peak: 0 }, { hour: '07:00', normal: 55, peak: 0 },
  { hour: '08:00', normal: 62, peak: 0 }, { hour: '09:00', normal: 70, peak: 0 },
  { hour: '10:00', normal: 58, peak: 0 }, { hour: '11:00', normal: 84, peak: 0 },
  { hour: '12:00', normal: 0, peak: 92 },
  { hour: '13:00', normal: 88, peak: 0 }, { hour: '14:00', normal: 76, peak: 0 },
  { hour: '15:00', normal: 81, peak: 0 }, { hour: '16:00', normal: 73, peak: 0 },
  { hour: '17:00', normal: 69, peak: 0 }, { hour: '18:00', normal: 49, peak: 0 },
  { hour: '19:00', normal: 55, peak: 0 }, { hour: '20:00', normal: 28, peak: 0 },
  { hour: '21:00', normal: 18, peak: 0 }, { hour: '22:00', normal: 26, peak: 0 },
  { hour: '23:00', normal: 0, peak: 0 },
];

export const mockActivitySummary: ActivitySummary = {
  total: 1174,
  vsYesterdayPct: 36.0,
  peakHour: '12:00',
};
