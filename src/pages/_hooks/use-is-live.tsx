import * as React from 'react';

const LIVE_NOW = 'Live now!';
const DEFAULT_MESSAGE = 'Join us!';
const MEETING_TIME_ZONE = 'America/New_York';

const DAYS_MS = 24 * 60 * 60 * 1000;
const HOURS_MS = 60 * 60 * 1000;
const MINUTES_MS = 60 * 1000;
const TEN_MINUTES_MS = 10 * MINUTES_MS;

const MEETING_DAY = 3; // Wednesday
const MEETING_HOUR = 13; // 1pm
const MEETING_LENGTH = 1; // 1 hour

type MeetingWindow = {
  nowMs: number;
  startMs: number;
  endMs: number;
};

function useIsLive() {
  const [countdown, setCountdown] = React.useState(DEFAULT_MESSAGE);

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    function updateCountdown() {
      try {
        const { nowMs, startMs, endMs } = getMeetingWindow();

        if (nowMs >= startMs && nowMs <= endMs) {
          setCountdown(LIVE_NOW);
        } else {
          const diff = startMs - nowMs;
          const days = Math.floor(diff / DAYS_MS);
          const hours = Math.floor((diff % DAYS_MS) / (60 * 60 * 1000));
          const minutes = Math.floor((diff % HOURS_MS) / MINUTES_MS);

          setCountdown(`${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes}m`);
        }

        timeout = setTimeout(updateCountdown, 60 * 1000); // 60 seconds
      } catch {
        // unable to determine dates, just show the default message
        setCountdown(DEFAULT_MESSAGE);
      }
    }

    updateCountdown();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const isLive = countdown === LIVE_NOW;
  let showLinks = isLive;
  try {
    const { nowMs, startMs } = getMeetingWindow();
    showLinks = isLive || nowMs >= startMs - TEN_MINUTES_MS;
  } catch {
    showLinks = isLive;
  }

  return { countdown, isLive, showLinks };
}

function getMeetingWindow(): MeetingWindow {
  const now = new Date();
  const zonedNow = getZonedParts(now, MEETING_TIME_ZONE);

  let dayOffset = (MEETING_DAY - zonedNow.weekday + 7) % 7;
  const meetingIsToday = dayOffset === 0;
  const nowMinutes = zonedNow.hour * 60 + zonedNow.minute;
  const meetingEndMinutes = (MEETING_HOUR + MEETING_LENGTH) * 60;

  if (meetingIsToday && nowMinutes >= meetingEndMinutes) {
    dayOffset = 7;
  }

  const targetDate = new Date(Date.UTC(zonedNow.year, zonedNow.month - 1, zonedNow.day));
  targetDate.setUTCDate(targetDate.getUTCDate() + dayOffset);

  const startMs = zonedDateTimeToUtcMs(
    {
      year: targetDate.getUTCFullYear(),
      month: targetDate.getUTCMonth() + 1,
      day: targetDate.getUTCDate(),
      hour: MEETING_HOUR,
      minute: 0,
    },
    MEETING_TIME_ZONE,
  );

  return {
    nowMs: now.getTime(),
    startMs,
    endMs: startMs + MEETING_LENGTH * 60 * 60 * 1000,
  };
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
};

type ZonedDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(date);

  const values = new Map(parts.map(({ type, value }) => [type, value]));
  const weekday = values.get('weekday');

  return {
    year: Number(values.get('year')),
    month: Number(values.get('month')),
    day: Number(values.get('day')),
    hour: Number(values.get('hour')),
    minute: Number(values.get('minute')),
    second: Number(values.get('second')),
    weekday: weekdayToIndex(weekday),
  };
}

function weekdayToIndex(weekday?: string): number {
  switch (weekday) {
    case 'Sun':
      return 0;
    case 'Mon':
      return 1;
    case 'Tue':
      return 2;
    case 'Wed':
      return 3;
    case 'Thu':
      return 4;
    case 'Fri':
      return 5;
    case 'Sat':
      return 6;
    default:
      throw new Error(`Unsupported weekday: ${weekday}`);
  }
}

function getOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  }).formatToParts(date);

  const offset = parts.find(({ type }) => type === 'timeZoneName')?.value;
  if (!offset || !offset.startsWith('GMT')) {
    throw new Error(`Unsupported time zone offset: ${offset}`);
  }
  if (offset === 'GMT') return 0;

  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(offset);
  if (!match) {
    throw new Error(`Unable to parse time zone offset: ${offset}`);
  }

  const [, sign, hours, minutes = '00'] = match;
  const totalMinutes = Number(hours) * 60 + Number(minutes);
  return sign === '-' ? -totalMinutes : totalMinutes;
}

function zonedDateTimeToUtcMs(dateTime: ZonedDateTime, timeZone: string): number {
  const utcGuess = Date.UTC(
    dateTime.year,
    dateTime.month - 1,
    dateTime.day,
    dateTime.hour,
    dateTime.minute,
    0,
  );

  let offsetMinutes = getOffsetMinutes(new Date(utcGuess), timeZone);
  let adjusted = utcGuess - offsetMinutes * MINUTES_MS;
  const correctedOffsetMinutes = getOffsetMinutes(new Date(adjusted), timeZone);

  if (correctedOffsetMinutes !== offsetMinutes) {
    offsetMinutes = correctedOffsetMinutes;
    adjusted = utcGuess - offsetMinutes * MINUTES_MS;
  }

  return adjusted;
}

export default useIsLive;
