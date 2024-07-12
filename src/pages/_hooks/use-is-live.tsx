import * as React from 'react';

const LIVE_NOW = 'Live now!';

function useIsLive() {
  const [countdown, setCountdown] = React.useState('7d 00h 00m');

  React.useEffect(() => {
    let timeout = null;

    function updateCountdown() {
      const now = new Date();
      const wednesday = getWednesday();
      const [start, end] = getStartEnd(wednesday);

      if (now >= start && now <= end) {
        setCountdown(LIVE_NOW);
      } else {
        // calculate the time until the next wasmCloud Wednesday
        const diff = wednesday.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // update the countdown
        setCountdown(`in ${days}d ${hours}h ${minutes}m`);
      }

      timeout = setTimeout(updateCountdown, 60 * 1000); // 60 seconds
    }

    updateCountdown();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const isLive = countdown === LIVE_NOW;
  const wednesday = getWednesday();
  const [start, end] = getStartEnd(wednesday);

  return { countdown, isLive, wednesday, start, end };
}

function getWednesday() {
  const now = new Date();
  const wednesday = new Date();
  wednesday.setUTCHours(17, 0, 0, 0); // 5pm UTC
  if (now.getUTCDay() <= 3) {
    wednesday.setDate(wednesday.getDate() + (3 - now.getUTCDay()));
  } else {
    wednesday.setDate(wednesday.getDate() + (10 - now.getUTCDay()));
  }
  const [, end] = getStartEnd(wednesday);
  if (now >= end) {
    wednesday.setDate(wednesday.getDate() + 7);
  }
  return wednesday;
}

function getStartEnd(time) {
  const start = new Date(time.getTime());
  start.setUTCHours(17, 0, 0, 0);
  const end = new Date(time.getTime());
  end.setUTCHours(18, 0, 0, 0);
  return [start, end];
}

export default useIsLive;
