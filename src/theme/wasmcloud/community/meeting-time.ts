/**
 * Wall-clock start time of the weekly wasmCloud community call.
 *
 * Every meeting page's frontmatter carries only a calendar date
 * (`date: 'YYYY-MM-DD'`), which Docusaurus turns into midnight UTC —
 * 8 PM Eastern the *previous* evening. That timestamp then leaked into
 * Event.startDate, VideoObject.uploadDate, and the BlogPosting/Article
 * datePublished for every meeting. The call actually starts at
 * 1:00 PM America/New_York, so anchor all community JSON-LD there.
 *
 * A page can override the start with `start_time: 'HH:MM'` (Eastern wall
 * clock) in frontmatter for the rare off-schedule call.
 */
export const MEETING_START_HOUR = 13;
export const MEETING_START_MINUTE = 0;

/** nth Sunday (1-based) of a month, as a day-of-month number (UTC math). */
function nthSunday(year: number, monthIndex: number, n: number): number {
  const firstDow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const firstSunday = 1 + ((7 - firstDow) % 7);
  return firstSunday + 7 * (n - 1);
}

/**
 * UTC offset in hours for America/New_York on a calendar date, using the
 * US DST rule (second Sunday in March → first Sunday in November).
 * Computed by hand rather than via Intl so SSR and hydration always agree.
 * Only valid for afternoon wall-clock times (no 2 AM transition ambiguity).
 */
export function easternOffsetHours(year: number, monthIndex: number, day: number): number {
  const dstStart = nthSunday(year, 2, 2); // March
  const dstEnd = nthSunday(year, 10, 1); // November
  const afterStart = monthIndex > 2 || (monthIndex === 2 && day >= dstStart);
  const beforeEnd = monthIndex < 10 || (monthIndex === 10 && day < dstEnd);
  return afterStart && beforeEnd ? -4 : -5;
}

/** Extract YYYY-MM-DD from a Docusaurus date (string or Date). */
function calendarDate(date: unknown): [number, number, number] | null {
  let iso: string | undefined;
  if (date instanceof Date) iso = date.toISOString();
  else if (typeof date === 'string') iso = date;
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? [Number(m[1]), Number(m[2]) - 1, Number(m[3])] : null;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function parseStartTime(raw: unknown): [number, number] {
  if (typeof raw === 'string') {
    const m = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return [Number(m[1]), Number(m[2])];
  }
  return [MEETING_START_HOUR, MEETING_START_MINUTE];
}

/**
 * ISO 8601 start of the meeting with an explicit Eastern offset, e.g.
 * `2026-09-23T13:00:00-04:00`. Returns undefined when the date is unusable.
 */
export function meetingStartIso(date: unknown, startTime?: unknown): string | undefined {
  const cd = calendarDate(date);
  if (!cd) return undefined;
  const [y, mo, d] = cd;
  const [hh, mm] = parseStartTime(startTime);
  const off = easternOffsetHours(y, mo, d);
  const sign = off < 0 ? '-' : '+';
  return `${y}-${pad(mo + 1)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00${sign}${pad(Math.abs(off))}:00`;
}

/** ISO 8601 timestamp `seconds` after `startIso`, keeping the same offset. */
export function addSecondsIso(startIso: string, seconds: number): string {
  const m = startIso.match(/([+-])(\d{2}):(\d{2})$/);
  const offMin = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  const local = new Date(new Date(startIso).getTime() + seconds * 1000 + offMin * 60000);
  const tz = m ? `${m[1]}${m[2]}:${m[3]}` : 'Z';
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}${tz}`
  );
}
