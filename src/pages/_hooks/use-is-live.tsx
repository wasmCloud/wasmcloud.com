import * as React from 'react';

const LIVE_NOW = 'Live now!';

const DAYS_MS = 24 * 60 * 60 * 1000;
const HOURS_MS = 60 * 60 * 1000;
const MINUTES_MS = 60 * 1000;
const TEN_MINUTES_MS = 10 * MINUTES_MS;

const MEETING_DAY = 3; // Wednesday
const MEETING_HOUR = 13; // 1pm
const MEETING_LENGTH = 1; // 1 hour

function useIsLive() {
  const [countdown, setCountdown] = React.useState('Join us!');

  React.useEffect(() => {
    let timeout = null;

    function updateCountdown() {
      const now = new Date();
      try {
        const [start, end] = getStartEnd();

        if (now >= start && now <= end) {
          setCountdown(LIVE_NOW);
        } else {
          // calculate the time until the next wasmCloud Wednesday
          const diff = start.getTime() - now.getTime();
          const days = Math.floor(diff / DAYS_MS);
          const hours = Math.floor((diff % DAYS_MS) / HOURS_MS);
          const minutes = Math.floor((diff % HOURS_MS) / MINUTES_MS);

          // update the countdown
          setCountdown(`${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes}m`);
        }

        timeout = setTimeout(updateCountdown, 60 * 1000); // 60 seconds
      } catch {
        // unable to determine dates, just show the default message
        setCountdown('Join us!');
      }
    }

    updateCountdown();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const isLive = countdown === LIVE_NOW;
  const [start] = getStartEnd();
  const tenMinutesBeforeStart = new Date(start.getTime() - TEN_MINUTES_MS);
  const now = new Date();
  const showLinks = isLive || now >= tenMinutesBeforeStart;

  return { countdown, isLive, showLinks };
}

function getStartEnd() {
  const now = new Date(getTimeInNYC());
  const start = new Date(getTimeInNYC({ hour: MEETING_HOUR, minute: 0 }));

  const meetingDayIsLaterThisWeek = now.getDay() < MEETING_DAY;
  const meetingDayIsToday = now.getDay() === MEETING_DAY;
  const meetingIsNotOver = meetingDayIsToday && now.getHours() < MEETING_HOUR + MEETING_LENGTH;

  if (meetingDayIsLaterThisWeek || (meetingDayIsToday && meetingIsNotOver)) {
    start.setDate(start.getDate() + (start.getDay() - MEETING_DAY));
  } else {
    start.setDate(start.getDate() + (MEETING_DAY + 7 - start.getDay()));
  }

  const end = new Date(start);
  end.setHours(start.getHours() + MEETING_LENGTH);

  return [start, end];
}

function getTimeInNYC({ hour, minute }: { hour?: number; minute?: number } = {}) {
  const now = new Date();
  now.setHours(hour ?? now.getHours(), minute ?? now.getMinutes(), 0, 0);

  // Using Intl.DateTimeFormat to get the NYC TZ offset in the format we need. This
  // accounts for Wednesdays that are in daylight saving time.
  const offsetToNy = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Australia/Sydney',
      timeZoneName: 'shortOffset',
      hour: 'numeric',
    })
      .formatToParts()
      .find(({ type }) => type === 'timeZoneName')
      .value.replace(/GMT([+-]\d+)/, '$1'),
    10,
  );

  // Adjust the current UTC time to NYC time by adding the offset
  now.setUTCHours(now.getUTCHours() + offsetToNy);

  // Format the offset to a string with leading zero like "+05:00"
  const prefix = offsetToNy < 0 ? '-' : '+';
  const padding = Math.abs(offsetToNy) < 10 ? '0' : '';
  const offsetString = `${prefix}${padding}${Math.abs(offsetToNy)}:00`;

  // Return the time in NYC as an ISO string, replacing the Z with the correct timezone offset
  return now.toISOString().replace(/Z$/, offsetString);
}

export default useIsLive;
