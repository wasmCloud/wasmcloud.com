import React from 'react';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import Link from '@docusaurus/Link';
import speakersData from '@site/src/data/speakers.json';
import styles from './styles.module.css';

type Person = {
  slug: string;
  name: string;
  org?: string;
  role?: string;
  aliases?: string[];
};

type Organization = {
  url: string;
  type?: string;
};

type SpeakersData = {
  team: Person[];
  externals?: Person[];
  alumni?: Person[];
  organizations: Record<string, Organization>;
};

const data = speakersData as SpeakersData;

const COSMONIC_URL = 'https://cosmonic.com';

type Bucket = 'team' | 'external' | 'alumni';

function lookup(slug: string): { person: Person; bucket: Bucket } | null {
  for (const p of data.team) if (p.slug === slug) return { person: p, bucket: 'team' };
  for (const p of data.externals ?? []) if (p.slug === slug) return { person: p, bucket: 'external' };
  for (const p of data.alumni ?? []) if (p.slug === slug) return { person: p, bucket: 'alumni' };
  return null;
}

function orgUrl(org?: string): string | undefined {
  if (!org) return undefined;
  return data.organizations[org]?.url;
}

/**
 * Renders a "Speakers" section listing people who appeared in the meeting,
 * sourced from frontmatter `speakers:` (array of slugs referencing
 * src/data/speakers.json).
 *
 * Cosmonic team + alumni: name links to cosmonic.com, affiliation shown
 *   after a middot. Renders as "Name · Role, Cosmonic" (team) or
 *   "Name · Cosmonic alumni" (alumni).
 *
 * External: name links to their org URL, affiliation shown as bare org name.
 *   "Name · Org". If no org is registered, name renders as plain text.
 */
export default function MeetingSpeakers(): JSX.Element | null {
  const { metadata } = useBlogPost();
  const fm = metadata.frontMatter as { speakers?: string[] };
  const slugs = fm.speakers;
  if (!slugs || slugs.length === 0) return null;

  const entries = slugs
    .map((slug) => lookup(slug))
    .filter((e): e is { person: Person; bucket: Bucket } => e !== null);

  if (entries.length === 0) return null;

  return (
    <aside className={styles.speakers} aria-label="Speakers">
      <h3 className={styles.heading}>Speakers</h3>
      <ul className={styles.list}>
        {entries.map(({ person, bucket }) => {
          const cosmonic = bucket === 'team' || bucket === 'alumni';
          const linkUrl = cosmonic ? COSMONIC_URL : orgUrl(person.org);

          const nameNode = linkUrl ? (
            <Link to={linkUrl} className={styles.name}>
              {person.name}
            </Link>
          ) : (
            <span className={styles.name}>{person.name}</span>
          );

          const cosmonicLink = (
            <Link to={COSMONIC_URL} className={styles.affiliationLink}>
              Cosmonic
            </Link>
          );

          let affiliation: React.ReactNode = null;
          if (bucket === 'team') {
            affiliation = person.role ? (
              <>
                {person.role}, {cosmonicLink}
              </>
            ) : (
              cosmonicLink
            );
          } else if (bucket === 'alumni') {
            affiliation = <>{cosmonicLink} alumni</>;
          } else if (person.org) {
            const extUrl = orgUrl(person.org);
            affiliation = extUrl ? (
              <Link to={extUrl} className={styles.affiliationLink}>
                {person.org}
              </Link>
            ) : (
              person.org
            );
          }

          return (
            <li key={person.slug} className={styles.item}>
              {nameNode}
              {affiliation ? (
                <>
                  <span className={styles.divider}> · </span>
                  <span className={styles.affiliation}>{affiliation}</span>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
