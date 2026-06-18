import React from 'react';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { usePluginData } from '@docusaurus/useGlobalData';
import peopleData from '@site/src/data/people.json';
import { isTranscriptPermalink } from '../utils';
import styles from './styles.module.css';

type Person = {
  slug: string;
  name: string;
  org?: string;
  wasmcloud_role?: 'maintainer' | 'contributor' | 'community' | 'emeritus';
  aliases?: string[];
};

type PeopleData = {
  people: Person[];
};

const data = peopleData as PeopleData;

function lookup(slug: string): Person | null {
  return data.people.find((p) => p.slug === slug) ?? null;
}

const WASMCLOUD_ROLE_PILLS: Partial<
  Record<NonNullable<Person['wasmcloud_role']>, { label: string; className: string }>
> = {
  maintainer: { label: 'Maintainer', className: styles.roleMaintainer },
  emeritus: { label: 'Emeritus Maintainer', className: styles.roleEmeritus },
};

type CommunitySpeakersData = { speakersByDate: Record<string, string[]> };

const DATE_FROM_PERMALINK_RE = /\/(\d{4}-\d{2}-\d{2})-community-meeting/;

/**
 * Renders a "Speakers" section listing people who appeared in the meeting,
 * sourced from frontmatter `speakers:` (array of slugs referencing
 * src/data/speakers.json).
 *
 * Each speaker renders as "Name · <wasmCloud project role>" — surfacing
 * the project-relevant signal (Maintainer / Emeritus Maintainer) without
 * displaying employer affiliation. Speaker employer (org) is intentionally
 * not rendered here: affiliations decay quickly, and a single rendering on
 * historical meeting pages cannot capture point-in-time accuracy. The
 * transcripts themselves carry the contemporaneous context. Bare name is
 * shown for community speakers and guests (wasmcloud_role unset).
 *
 * The `org` field on each entry is still consumed by VideoSEO to populate
 * schema.org actor.affiliation for video rich-results — keep it in sync
 * with current employers per the canonical MAINTAINERS list.
 *
 * Source of speaker slugs:
 *   - Meeting page (`<date>-community-meeting`): the page's own frontmatter.
 *   - Transcript page (`<date>-community-meeting-transcript`): the sibling
 *     meeting page's frontmatter, looked up by date via globalData populated
 *     by the community-speakers plugin. This keeps speaker data in one place
 *     and prevents drift between the two surfaces.
 *
 * Person records resolved from `src/data/people.json` — the canonical
 * people registry. `authors.yml` is generated from the same file at
 * prebuild time, so blog bylines and meeting speaker pills share a
 * single source of truth.
 */
export default function MeetingSpeakers(): JSX.Element | null {
  const { metadata } = useBlogPost();
  const fm = metadata.frontMatter as { speakers?: string[] };
  const pluginData = usePluginData('community-speakers-plugin') as
    | CommunitySpeakersData
    | undefined;

  let slugs: string[] | undefined = fm.speakers;
  if (isTranscriptPermalink(metadata.permalink)) {
    const dateMatch = metadata.permalink.match(DATE_FROM_PERMALINK_RE);
    if (dateMatch && pluginData) {
      slugs = pluginData.speakersByDate[dateMatch[1]];
    }
  }
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
          const pill = person.wasmcloud_role
            ? WASMCLOUD_ROLE_PILLS[person.wasmcloud_role]
            : undefined;
          return (
            <li key={person.slug} className={styles.item}>
              <span className={styles.name}>{person.name}</span>
              {pill ? (
                <span className={`${styles.role} ${pill.className}`}>
                  {pill.label}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
