import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import useIsLive from '@site/src/pages/_hooks/use-is-live';
import styles from './get-involved.module.css';
import { Links } from '@site/src/constants';

type Props = {};

function GetInvolved({}: Props) {
  const { YOUTUBE, PLAYLIST, CALENDAR, ZOOM, GITHUB, SLACK } = Links;
  const { countdown, showLinks } = useIsLive();

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
                <a href={GITHUB}>
                  <img src="/img/pages/home/icon/github.svg" alt="" />
                  <span>Star wasmCloud on GitHub</span>
                </a>
              </li>
              <li>
                <a href={SLACK}>
                  <img src="/img/pages/home/icon/slack.svg" alt="" />
                  <span>Join our Slack community</span>
                </a>
              </li>
              <li>
                <a href={PLAYLIST} target="_blank" rel="noopener">
                  <img src="/img/pages/home/icon/youtube.svg" alt="" />
                  <span>Watch past Community Calls</span>
                </a>
              </li>
              <li>
                <a href={CALENDAR} target="_blank" rel="noopener">
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
            {showLinks ? (
              <div className={styles.buttons}>
                <a href={ZOOM} target="_blank" rel="noopener" className={styles.button}>
                  <img src="/img/pages/home/icon/zoom.svg" alt="" />
                  Join Live
                </a>
                <a href={YOUTUBE} target="_blank" rel="noopener" className={styles.button}>
                  <img src="/img/pages/home/icon/youtube.svg" alt="" />
                  Stream Live
                </a>
              </div>
            ) : (
              <div className={styles.buttons}>
                <a href={CALENDAR} target="_blank" rel="noopener" className={styles.button}>
                  <img src="/img/pages/home/icon/calendar.svg" alt="" />
                  Add to Cal
                </a>
                <a href={PLAYLIST} target="_blank" rel="noopener" className={styles.button}>
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
