import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

type WasmcloudRole = 'maintainer' | 'contributor' | 'community' | 'emeritus';

type IndexEntry = {
  slug: string;
  name: string;
  image_url?: string;
  org?: string;
  org_url?: string;
  wasmcloud_role?: WasmcloudRole;
  blog_post_count: number;
  community_meeting_count: number;
  external_works_count: number;
};

type PeopleIndexData = {
  entries: IndexEntry[];
};

const ROLE_PILLS: Partial<Record<WasmcloudRole, { label: string; className: string }>> = {
  maintainer: { label: 'Maintainer', className: styles.roleMaintainer },
  emeritus: { label: 'Emeritus Maintainer', className: styles.roleEmeritus },
};

/** Two-letter initials from the person's name. Matches the same helper
 *  on the profile page so the avatar fallback looks identical between
 *  the directory and the per-person page. */
function initialsOf(name: string): string {
  const tokens = name
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t[0]?.toUpperCase() ?? '');
  if (tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0];
  return tokens[0] + tokens[tokens.length - 1];
}

/** Compose the activity tally — only non-zero counts surface, so a
 *  speaker-only profile reads as "18 calls" instead of "0 posts · 18
 *  calls · 0 works". Uses tabular figures for column rhythm. */
function ActivityTally({ entry }: { entry: IndexEntry }): JSX.Element | null {
  const parts: Array<{ count: number; label: string }> = [];
  if (entry.blog_post_count > 0)
    parts.push({ count: entry.blog_post_count, label: 'posts' });
  if (entry.community_meeting_count > 0)
    parts.push({ count: entry.community_meeting_count, label: 'calls' });
  if (entry.external_works_count > 0)
    parts.push({ count: entry.external_works_count, label: 'works' });
  if (parts.length === 0) return null;
  return (
    <span className={styles.tally} aria-hidden="true">
      {parts.map((p, i) => (
        <React.Fragment key={p.label}>
          {i > 0 && <span className={styles.tallySep}>·</span>}
          <span className={styles.tallyItem}>
            <span className={styles.tallyCount}>{p.count}</span>{' '}
            <span className={styles.tallyLabel}>{p.label}</span>
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}

function PersonRow({ entry }: { entry: IndexEntry }): JSX.Element {
  const pill = entry.wasmcloud_role ? ROLE_PILLS[entry.wasmcloud_role] : undefined;
  const initials = initialsOf(entry.name);

  // The whole row is one accessible link to /people/<slug>/. Inner
  // anchors (org link) are intentionally NOT separately tabbable —
  // we don't want users to ever land mid-row from the keyboard.
  return (
    <li className={styles.row}>
      <Link to={`/people/${entry.slug}/`} className={styles.rowLink}>
        <div className={styles.avatarFrame}>
          {entry.image_url ? (
            <img
              src={entry.image_url}
              alt=""
              className={styles.avatar}
              loading="lazy"
            />
          ) : (
            <span className={styles.avatarInitials} aria-hidden="true">
              {initials}
            </span>
          )}
        </div>
        <div className={styles.rowText}>
          <span className={styles.name}>{entry.name}</span>
          <span className={styles.metaRow}>
            {pill && (
              <span className={`${styles.rolePill} ${pill.className}`}>{pill.label}</span>
            )}
            {entry.org && <span className={styles.org}>{entry.org}</span>}
          </span>
        </div>
        <ActivityTally entry={entry} />
      </Link>
    </li>
  );
}

export default function PeopleIndexPage({
  data,
}: {
  data: PeopleIndexData;
}): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const { entries } = data;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/people/#directory`,
    name: 'wasmCloud Maintainers',
    description:
      'Currently active wasmCloud maintainers — the people building and stewarding the project.',
    url: `${siteUrl}/people/`,
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/people/${e.slug}/`,
        name: e.name,
      })),
    },
  };

  return (
    <Layout
      title="Maintainers"
      description="Currently active wasmCloud maintainers — the people building and stewarding the project."
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
      </Head>

      <article className={`container ${styles.container}`}>
        <p className={styles.kicker}>wasmCloud community</p>

        <header className={styles.header}>
          <span className={styles.flavor}>behind the project</span>
          <h1 className={styles.title}>Maintainers</h1>
          <p className={styles.intro}>
            The people building wasmCloud — currently active maintainers across the
            project and its subrepositories.
          </p>
        </header>

        <ul className={styles.list}>
          {entries.map((entry) => (
            <PersonRow key={entry.slug} entry={entry} />
          ))}
        </ul>
      </article>
    </Layout>
  );
}
