const ZOOM = 'https://zoom.us/j/98144613430?pwd=VjBObmZIaUppUXVWRkxSZ3crZzhkZz09';

// Google Calendar "add event" link for the weekly community call, Wednesdays
// 1-2pm ET. The `recur` rule makes the added event repeat; copying an event
// from the shared calendar only ever copies a single occurrence.
const CALENDAR = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: 'TEMPLATE',
  text: 'wasmCloud Weekly Community Call',
  dates: '20230308T130000/20230308T140000',
  ctz: 'America/New_York',
  recur: 'RRULE:FREQ=WEEKLY;BYDAY=WE',
  location: ZOOM,
  details: `Agenda: https://wasmcloud.com/community\nJoin on Zoom: ${ZOOM}`,
})}`;

const Links = {
  YOUTUBE: 'https://youtube.com/live/0rcFomxfvTk',
  PLAYLIST: 'https://www.youtube.com/@wasmCloud/streams',
  CALENDAR,
  // CNCF (LFX) project meetings calendar; offers an iCal feed to subscribe to.
  CNCF_CALENDAR: 'https://zoom-lfx.platform.linuxfoundation.org/meetings/wasmcloud',
  ZOOM,
  GITHUB: 'https://github.com/wasmcloud/wasmcloud',
  SLACK: 'https://slack.wasmcloud.com',
} as const;

export { Links };
