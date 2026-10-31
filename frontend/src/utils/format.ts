// Sri Lankan display conventions: Rupees (Rs.), day-first dates, 12-hour time, Asia/Colombo time zone.

export const SL_TIME_ZONE = 'Asia/Colombo';

// Appointment times from the backend are zone-less local Sri Lankan times ("2026-11-02T09:00:00")
// and are shown as-is. Values carrying a zone (createdAt/timestamps, e.g. "...Z") are converted to Colombo time.
const zoneOptions = (value: string | Date): { timeZone?: string } =>
  typeof value === 'string' && !/(Z|[+-]\d{2}:?\d{2})$/i.test(value) ? {} : { timeZone: SL_TIME_ZONE };

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

/** 3500 -> "Rs. 3,500.00" */
export const formatLKR = (amount?: number | null): string =>
  amount == null
    ? '—'
    : `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** "Mon, 02 Nov 2026" (pass options to override) */
export const formatDate = (
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }
): string => toDate(value).toLocaleDateString('en-GB', { ...options, ...zoneOptions(value) });

/** "02:30 PM" */
export const formatTime = (value: string | Date): string =>
  toDate(value).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', hour12: true, ...zoneOptions(value) });

/** "02 Nov 2026, 02:30 PM" */
export const formatDateTime = (value: string | Date): string =>
  `${formatDate(value, { day: '2-digit', month: 'short', year: 'numeric' })}, ${formatTime(value)}`;

/** Today's date in Sri Lanka as "YYYY-MM-DD" (for date inputs and API params), shifted by offsetDays. */
export const colomboDateString = (offsetDays = 0): string => {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: SL_TIME_ZONE }).format(d);
};
