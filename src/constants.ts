const Links = {
  YOUTUBE: 'https://youtube.com/live/PWrul2fTquw',
  PLAYLIST: 'https://www.youtube.com/@wasmCloud/streams',
  // "Add to Google Calendar" link for the recurring weekly community call series.
  // tmeid is base64("<series event id> <calendar id>"). Use the series id
  // (…_R20230308T180000), not a single instance id, so the event repeats.
  CALENDAR:
    'https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MnA2a2R1MnI2aGxucDZwNjUxMmVuMW1lb2FfUjIwMjMwMzA4VDE4MDAwMCBjXzZjbTVodWQ4ZXZ1bnM0cGU1Z2d1M2g5cXJzQGc&tmsrc=c_6cm5hud8evuns4pe5ggu3h9qrs%40group.calendar.google.com',
  ZOOM: 'https://zoom.us/j/98144613430?pwd=VjBObmZIaUppUXVWRkxSZ3crZzhkZz09',
  GITHUB: 'https://github.com/wasmcloud/wasmcloud',
  SLACK: 'https://slack.wasmcloud.com',
} as const;

export { Links };
