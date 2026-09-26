export type TimeFormat = '24h' | '12h';

/**
 * Parses any date or time representation into { hours: number, minutes: number }
 */
export function extractHoursAndMinutes(input: Date | string | number): { hours: number; minutes: number } | null {
  if (!input) return null;

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return { hours: input.getHours(), minutes: input.getMinutes() };
  }

  if (typeof input === 'number') {
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    return { hours: d.getHours(), minutes: d.getMinutes() };
  }

  const str = String(input).trim();

  // Case 1: Simple HH:MM or HH:MM:SS
  const simpleMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (simpleMatch) {
    const h = parseInt(simpleMatch[1], 10);
    const m = parseInt(simpleMatch[2], 10);
    if (h >= 0 && h <= 24 && m >= 0 && m <= 59) {
      return { hours: h % 24, minutes: m };
    }
  }

  // Case 2: 12h format like '7:00 PM', '07:00pm', '12:30 am'
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    const isPM = ampmMatch[3].toLowerCase() === 'pm';
    if (h === 12) {
      h = isPM ? 12 : 0;
    } else if (isPM) {
      h += 12;
    }
    return { hours: h, minutes: m };
  }

  // Case 3: ISO string or date string (e.g. '2026-09-22T19:00:00' or with spaces)
  if (str.includes('T') || str.includes('-') || str.includes('/')) {
    // If it has 'T', e.g. '2026-09-22T19:00:00'
    const tIndex = str.indexOf('T');
    if (tIndex !== -1 && str.length >= tIndex + 6) {
      const timePart = str.substring(tIndex + 1, tIndex + 6);
      const [h, m] = timePart.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        return { hours: h, minutes: m };
      }
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return { hours: parsed.getHours(), minutes: parsed.getMinutes() };
    }
  }

  return null;
}

/**
 * Parses user-typed manual time input with high tolerance (e.g. "19:00", "1900", "9:30", "11pm", "7:30 PM", "9")
 */
export function parseManualTimeString(text: string): { hours: number; minutes: number } | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Case 1: 12-hour format with AM/PM (e.g. "11:30 PM", "9:15am", "7pm", "8 am")
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPM = ampmMatch[3].toLowerCase() === 'pm';

    if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
      if (h === 12) {
        h = isPM ? 12 : 0;
      } else if (isPM) {
        h += 12;
      }
      return { hours: h, minutes: m };
    }
  }

  // Case 2: standard HH:mm (e.g. "19:30", "9:30", "09:05")
  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10);
    const m = parseInt(colonMatch[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // Case 3: 3 or 4 digits without colon (e.g. "1930", "930", "0930")
  if (/^\d{3,4}$/.test(trimmed)) {
    const padded = trimmed.padStart(4, '0');
    const h = parseInt(padded.slice(0, 2), 10);
    const m = parseInt(padded.slice(2), 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // Case 4: single or double digit hour (e.g. "19" -> 19:00, "9" -> 09:00)
  if (/^\d{1,2}$/.test(trimmed)) {
    const h = parseInt(trimmed, 10);
    if (h >= 0 && h <= 23) {
      return { hours: h, minutes: 0 };
    }
  }

  return extractHoursAndMinutes(trimmed);
}

/**
 * Format a Date, ISO string, or time string into the specified TimeFormat ('24h' or '12h').
 */
export function formatTimeWithFormat(
  input: Date | string | number | undefined | null,
  format: TimeFormat = '24h'
): string {
  if (!input) return '';
  const parsed = extractHoursAndMinutes(input);
  if (!parsed) return String(input);

  const { hours, minutes } = parsed;
  const mStr = String(minutes).padStart(2, '0');

  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const hStr = String(h12).padStart(2, '0');
    return `${hStr}:${mStr} ${period}`;
  }

  // 24-hour format
  const hStr = String(hours).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

/**
 * Formats a time range (e.g. '19:00 - 22:30' or '07:00 PM - 10:30 PM')
 */
export function formatTimeRangeWithFormat(
  start: Date | string | number | undefined | null,
  end: Date | string | number | undefined | null,
  format: TimeFormat = '24h'
): string {
  const startStr = formatTimeWithFormat(start, format);
  const endStr = formatTimeWithFormat(end, format);
  if (!startStr && !endStr) return '';
  if (!startStr) return endStr;
  if (!endStr) return startStr;
  return `${startStr} - ${endStr}`;
}
