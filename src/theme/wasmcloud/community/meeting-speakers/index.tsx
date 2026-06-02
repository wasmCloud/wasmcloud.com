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
  wasmcloud_role?: 'maintainer' | 'contributor' | 'community' | 'emeritus';
  aliases?: string[];
};

type Organization = {
  url: string;
};

type SpeakersData = {
  speakers: Person[];
  organizations: Record<string, Organization>;
};

const data = speakersData as SpeakersData;

function lookup(slug: string): Person | null {
  return data.speakers.find((p) => p.slug === slug) ?? null;
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
 * Every speaker renders as "Name · [Role, ]Org" with the org name linked to
 * its homepage. No organization gets structural privilege; affiliation is
 * per-speaker.
 */
export default function MeetingSpeakers(): JSX.Element | null {
  const { metadata } = useBlogPost();
  const fm = metadata.frontMatter as { speakers?: string[] };
  const slugs = fm.speakers;
  if (!slugs || slugs.length === 0) return null;

  const entries = slugs
    .map((slug) => lookup(slug))
    .filter((p): p is Person => p !== null);

  if (entries.length === 0) return null;

  return (
    <aside className={styles.speakers} aria-label="Speakers">
      <h3 className={styles.heading}>Speakers</h3>
      <ul className={styles.list}>
        {entries.map((person) => {
          const url = orgUrl(person.org);
          const orgNode = person.org ? (
            url ? (
              <Link to={url} className={styles.affiliationLink}>
                {person.org}
              </Link>
            ) : (
              person.org
            )
          ) : null;

          const affiliation = orgNode ? (
            person.role ? (
              <>
                {person.role}, {orgNode}
              </>
            ) : (
              orgNode
            )
          ) : person.role ? (
            person.role
          ) : null;

          return (
            <li key={person.slug} className={styles.item}>
              <span className={styles.name}>{person.name}</span>
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
