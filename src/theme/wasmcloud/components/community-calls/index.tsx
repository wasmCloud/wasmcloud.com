import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type Chapter = { t: number; label: string };
type Meeting = {
  title: string;
  date: string;
  url: string;
  videoId: string;
  chapters: Chapter[];
};

function formatTime(t: number): string {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function CommunityCalls({
  meetings,
  title = 'This topic was discussed in our community calls',
}: {
  meetings: Meeting[];
  title?: string;
}): JSX.Element {
  return (
    <aside className={styles.callout} aria-label="Discussed in community meetings">
      <p className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          📺
        </span>
        {title}
      </p>
      <ul className={styles.meetings}>
        {meetings.map((m) => (
          <li key={m.url} className={styles.meeting}>
            <div className={styles.meetingRow}>
              <Link to={m.url} className={styles.meetingTitle}>
                {m.title}
              </Link>
              <span className={styles.date}>{m.date}</span>
            </div>
            <ul className={styles.chapters}>
              {m.chapters.map((c) => (
                <li key={c.t}>
                  <a
                    className={styles.chapter}
                    href={`https://youtu.be/${m.videoId}?t=${c.t}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={styles.time}>▶ {formatTime(c.t)}</span>
                    <span className={styles.label}>{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
