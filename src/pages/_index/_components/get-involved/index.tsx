import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './get-involved.module.css';

type Props = {};

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

const LIVE_NOW = 'Live now!';

function GetInvolved({}: Props) {
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
  const zoomLink = 'https://us02web.zoom.us/j/89608468294?pwd=Z0Z2Z0J2b0J2b0J2b0J2b0J2b0J2Zz09';
  const youtubeLink = 'https://www.youtube.com/watch?v=Q6J9Q6Q6Q6Q';
  const calendarLink =
    'https://calendar.google.com/calendar/u/0/r/eventedit/copy/MnA2a2R1MnI2aGxucDZwNjUxMmVuMW1lb2FfMjAyNDA3MTBUMTcwMDAwWiBjXzZjbTVodWQ4ZXZ1bnM0cGU1Z2d1M2g5cXJzQGc';
  const playlistLink =
    'https://www.youtube.com/@wasmCloud/videos?view=2&sort=dd&live_view=503&shelf_id=3';

  return (
    <Section color="green" id="community">
      <div className="container">
        <SectionTag>Get Involved</SectionTag>
        <SectionHeading>Join the community</SectionHeading>
        <div className={styles.content}>
          <div>
            <p>
              Stop in to a wasmCloud Wednesday meeting, host a WebAssembly meetup, drop in on our
              Slack channel. There are plenty of ways to get connected with the wider community for
              support, insight, use-cases and expertise.
            </p>
            <ul>
              <li>
                <a href="https://github.com/wasmcloud/wasmcloud">
                  <img src="/img/pages/home/icon/github.svg" alt="" />
                  <span>Star wasmCloud on GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://slack.wasmcloud.com">
                  <img src="/img/pages/home/icon/slack.svg" alt="" />
                  <span>Join our Slack community</span>
                </a>
              </li>
              <li>
                <a href={playlistLink} target="_blank" rel="noreferrer">
                  <img src="/img/pages/home/icon/youtube.svg" alt="" />
                  <span>Watch past Community Calls</span>
                </a>
              </li>
              <li>
                <a href={calendarLink} target="_blank" rel="noreferrer">
                  <img src="/img/pages/home/icon/calendar.svg" alt="" />
                  <span>Add to your calendar</span>
                </a>
              </li>
            </ul>
          </div>
          <div className={styles.wednesday}>
            <h4>
              wasmCloud Wednesday
              <span>{countdown}</span>
            </h4>
            {isLive ? (
              <div className={styles.wednesdayButtons}>
                <a href={zoomLink} className={styles.wednesdayButton}>
                  <img src="/img/pages/home/icon/zoom.svg" alt="" />
                  Join Live
                </a>
                <a href={youtubeLink} className={styles.wednesdayButton}>
                  <img src="/img/pages/home/icon/youtube.svg" alt="" />
                  Stream Live
                </a>
              </div>
            ) : (
              <div className={styles.wednesdayButtons}>
                <a href={calendarLink} className={styles.wednesdayButton}>
                  <img src="/img/pages/home/icon/calendar.svg" alt="" />
                  Add to Cal
                </a>
                <a href={playlistLink} className={styles.wednesdayButton}>
                  <img src="/img/pages/home/icon/youtube.svg" alt="" />
                  Past Calls
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

export { GetInvolved };
