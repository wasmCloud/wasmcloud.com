import * as React from 'react';
import styles from './wednesday.module.css';
import useIsLive from '@site/src/pages/_hooks/use-is-live';
import { Links } from '@site/src/constants';
import Link from '@docusaurus/Link';

function Wednesday(): React.ReactElement {
  const { YOUTUBE, PLAYLIST, CALENDAR, ZOOM } = Links;
  const { countdown, showLinks } = useIsLive();
  return (
    <div className={styles.wednesday}>
      <h4>
        wasmCloud Wednesday
        <span>{countdown}</span>
      </h4>
      {showLinks ? (
        <div className={styles.buttons}>
          <Link href={ZOOM} className={styles.button}>
            <img src="/pages/home/icon/zoom.svg" alt="" />
            Join Live
          </Link>
          <Link href={YOUTUBE} className={styles.button}>
            <img src="/pages/home/icon/youtube.svg" alt="" />
            Stream Live
          </Link>
        </div>
      ) : (
        <div className={styles.buttons}>
          <Link href={CALENDAR} className={styles.button}>
            <img src="/pages/home/icon/calendar.svg" alt="" />
            Add to Cal
          </Link>
          <Link href={PLAYLIST} className={styles.button}>
            <img src="/pages/home/icon/youtube.svg" alt="" />
            Past Calls
          </Link>
        </div>
      )}
    </div>
  );
}

export { Wednesday };
