/**
 * Returns the local date string (YYYY-MM-DD) for a given Date object.
 * Uses local year/month/day instead of toISOString() which returns UTC
 * and can shift the date in UTC+ timezones during midnight hours.
 */
export const toLocalDateStr = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Returns today's local date string (YYYY-MM-DD).
 */
export const todayLocalStr = (): string => toLocalDateStr(new Date());
