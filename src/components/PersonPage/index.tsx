import React, { useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

type WasmcloudRole = 'maintainer' | 'contributor' | 'community' | 'emeritus';
type ExternalWorkType = 'writing' | 'talk' | 'podcast' | 'video';

type ExternalWork = {
  title: string;
  venue?: string;
  year?: number;
  url?: string;
  type?: ExternalWorkType;
};

type Person = {
  slug: string;
  name: string;
  authors_key?: string;
  byline_title?: string;
  image_url?: string;
  url?: string;
  org?: string;
  wasmcloud_role?: WasmcloudRole;
  bio?: string;
  location?: string;
  same_as?: string[];
  knows_about?: string[];
  external_works?: ExternalWork[];
};

type Appearance = {
  title: string;
  url: string;
  date: string;
  image?: string;
  description?: string;
};

type PersonPageData = {
  person: Person;
  org_url?: string;
  blog_posts: Appearance[];
  community_meetings: Appearance[];
};

// Source-of-truth for role pill copy. Mirrors the same labels used by
// the meeting-speakers chip so the project-role signal stays consistent
// across surfaces.
const ROLE_PILLS: Partial<Record<WasmcloudRole, { label: string; className: string }>> = {
  maintainer: { label: 'Maintainer', className: styles.roleMaintainer },
  emeritus: { label: 'Emeritus Maintainer', className: styles.roleEmeritus },
};

// Long lists become hard to scan and obscure the page structure below
// them. Initially we render the most recent items only; everything
// beyond hides behind a single Show all toggle.
const VISIBLE_THRESHOLD = 5;

function formatDate(iso: string): string {
  // Render `YYYY-MM-DD` as e.g. "May 21, 2025". Use UTC to avoid
  // hydration-time timezone wobble that would shift the day for late
  // east-coast / early west-coast renders.
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Two-letter initials from the person's name. Falls back to one
 *  letter for single-token names; empty string for empty input (caller
 *  should guard). */
function initialsOf(name: string): string {
  const tokens = name
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t[0]?.toUpperCase() ?? '');
  if (tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0];
  return tokens[0] + tokens[tokens.length - 1];
}

/** Build a single `subjectOf` entry for an on-site blog post. Article
 *  schema requires headline + author + publisher + datePublished + image
 *  for rich-results eligibility; we satisfy all of these except `image`
 *  for posts that don't ship a hero (rare). */
function blogPostSubjectOf(
  a: Appearance,
  personId: string,
  siteUrl: string,
  organizationId: string,
): Record<string, unknown> {
  const fullUrl = `${siteUrl}${a.url}`;
  const absImage = a.image
    ? a.image.startsWith('http')
      ? a.image
      : `${siteUrl}${a.image}`
    : undefined;
  return {
    '@type': 'Article',
    '@id': `${fullUrl}#article`,
    headline: a.title,
    url: fullUrl,
    mainEntityOfPage: fullUrl,
    datePublished: a.date,
    author: { '@id': personId },
    publisher: { '@id': organizationId },
    ...(absImage && { image: absImage }),
    ...(a.description && { description: a.description }),
  };
}

/** Build a single `subjectOf` entry for an on-site community meeting.
 *  VideoObject schema requires name + description + thumbnailUrl +
 *  uploadDate for rich-results eligibility. Community meetings all have
 *  YouTube `maxresdefault.jpg` thumbnails so `thumbnailUrl` is reliable
 *  here; `description` comes from the meeting page's frontmatter, with
 *  a sensible fallback when absent. */
function communityMeetingSubjectOf(
  a: Appearance,
  siteUrl: string,
  organizationId: string,
): Record<string, unknown> {
  const fullUrl = `${siteUrl}${a.url}`;
  return {
    '@type': 'VideoObject',
    '@id': `${fullUrl}#video`,
    name: a.title,
    description: a.description ?? `wasmCloud community call — ${a.title}.`,
    url: fullUrl,
    uploadDate: a.date,
    publisher: { '@id': organizationId },
    ...(a.image && { thumbnailUrl: a.image }),
  };
}

/** Build a single `subjectOf` entry for an external work the person
 *  authored or appeared in. Returns null when the entry can't satisfy
 *  the minimum required schema.org fields for its type (e.g. a `talk`
 *  with no venue + year would fail Event validation; better to skip
 *  the entry than emit an invalid one). */
function externalWorkSubjectOf(
  w: NonNullable<Person['external_works']>[number],
  personId: string,
): Record<string, unknown> | null {
  if (!w.title) return null;
  const yearDate = w.year ? `${w.year}-01-01` : undefined;

  switch (w.type ?? 'writing') {
    case 'writing':
      // Article requires headline + datePublished + publisher. Skip if
      // we can't supply all three.
      if (!yearDate || !w.venue) return null;
      return {
        '@type': 'Article',
        headline: w.title,
        ...(w.url && { url: w.url, mainEntityOfPage: w.url }),
        datePublished: yearDate,
        author: { '@id': personId },
        publisher: { '@type': 'Organization', name: w.venue },
      };
    case 'talk':
      // Event requires name + startDate + location.
      if (!yearDate || !w.venue) return null;
      return {
        '@type': 'Event',
        name: w.title,
        ...(w.url && { url: w.url }),
        startDate: yearDate,
        location: { '@type': 'Place', name: w.venue },
        organizer: { '@type': 'Organization', name: w.venue },
        eventStatus: 'https://schema.org/EventScheduled',
        performer: { '@id': personId },
      };
    case 'podcast':
      // PodcastEpisode requires name + url + partOfSeries.
      if (!w.url || !w.venue) return null;
      return {
        '@type': 'PodcastEpisode',
        name: w.title,
        url: w.url,
        partOfSeries: { '@type': 'PodcastSeries', name: w.venue },
        ...(yearDate && { datePublished: yearDate }),
      };
    case 'video':
      // VideoObject requires name + description + thumbnailUrl + uploadDate;
      // we don't capture thumbnails for external videos, so promote to
      // Article instead. Article in turn requires publisher — skip
      // entries that have no `venue` rather than emit an invalid one
      // (the entry still renders in the "Around the web" list, it just
      // doesn't appear in `subjectOf`).
      if (!yearDate || !w.venue) return null;
      return {
        '@type': 'Article',
        headline: w.title,
        ...(w.url && { url: w.url }),
        author: { '@id': personId },
        datePublished: yearDate,
        publisher: { '@type': 'Organization', name: w.venue },
      };
    default:
      return null;
  }
}

/** Build the Person JSON-LD entity. Only emits properties we have data
 *  for — empty arrays and undefined fields are dropped. Note we don't
 *  emit a BreadcrumbList ourselves: Docusaurus auto-emits one for every
 *  route, and a second one with different labels would just confuse
 *  parsers. */
function personJsonLd(data: PersonPageData, siteUrl: string) {
  const { person, org_url, blog_posts, community_meetings } = data;
  const pageUrl = `${siteUrl}/people/${person.slug}/`;
  const personId = `${pageUrl}#person`;
  const organizationId = `${siteUrl}/#organization`;

  const sameAs = new Set<string>();
  if (person.url) sameAs.add(person.url);
  for (const link of person.same_as ?? []) sameAs.add(link);

  const subjectOf: Record<string, unknown>[] = [
    ...blog_posts.map((a) =>
      blogPostSubjectOf(a, personId, siteUrl, organizationId),
    ),
    ...community_meetings.map((a) =>
      communityMeetingSubjectOf(a, siteUrl, organizationId),
    ),
    ...(person.external_works ?? [])
      .map((w) => externalWorkSubjectOf(w, personId))
      .filter((x): x is Record<string, unknown> => x !== null),
  ];

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: person.name,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
  };
  if (person.image_url) ld.image = person.image_url;
  if (person.byline_title) ld.jobTitle = person.byline_title;
  if (person.org) {
    ld.worksFor = {
      '@type': 'Organization',
      name: person.org,
      ...(org_url && { url: org_url }),
    };
  }
  ld.affiliation = {
    '@type': 'Organization',
    '@id': organizationId,
    name: 'wasmCloud',
    url: `${siteUrl}/`,
  };
  if (sameAs.size > 0) ld.sameAs = [...sameAs];
  if (person.knows_about && person.knows_about.length > 0) {
    ld.knowsAbout = person.knows_about;
  }
  if (subjectOf.length > 0) ld.subjectOf = subjectOf;
  return ld;
}

/** Pick the best label for an external link. Restricted to GitHub,
 *  LinkedIn, and social platforms (X, Bluesky, Mastodon). Personal
 *  sites, Sessionize, Medium, Keybase, GitLab, etc. resolve to `null`
 *  so they're filtered out of the rendered chip list — they're still
 *  emitted into the JSON-LD `sameAs` for the schema.org signal, just
 *  not surfaced as a hero chip for the reader. */
function platformLabel(href: string): { label: string; icon?: 'github' } | null {
  const host = hostnameOf(href);
  if (host === 'github.com') return { label: 'GitHub', icon: 'github' };
  if (host === 'linkedin.com') return { label: 'LinkedIn' };
  if (host === 'x.com' || host === 'twitter.com') return { label: 'X' };
  if (host === 'bsky.app' || host.endsWith('.bsky.app')) return { label: 'Bluesky' };
  if (host === 'hachyderm.io' || host.endsWith('.hachyderm.io')) return { label: 'Mastodon' };
  // Future: add other Mastodon instances (mastodon.social, etc.) here
  // as maintainers add them to people.json.
  return null;
}

function ExternalLink({ href }: { href: string }): JSX.Element | null {
  const platform = platformLabel(href);
  if (!platform) return null;
  return (
    <Link to={href} className={styles.externalLink}>
      {platform.icon === 'github' && (
        <img
          src="/icons/github.svg"
          alt=""
          aria-hidden="true"
          className={styles.externalLinkIcon}
        />
      )}
      <span>{platform.label}</span>
    </Link>
  );
}

/**
 * Toggle button rendered below collapsible lists. Sits at the same
 * indent as item content so it reads as part of the list, not as
 * floating page chrome.
 */
function CollapseToggle({
  expanded,
  total,
  onToggle,
  label,
}: {
  expanded: boolean;
  total: number;
  onToggle: () => void;
  /** Lower-case noun for the items in the list — `posts`, `calls`,
   *  `works`. Used to compose the toggle copy. */
  label: string;
}): JSX.Element {
  return (
    <button
      type="button"
      className={styles.collapseToggle}
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <span className={styles.collapseToggleText}>
        {expanded
          ? `Show recent ${VISIBLE_THRESHOLD} ${label}`
          : `Show all ${total} ${label}`}
      </span>
      <span
        className={`${styles.collapseChevron} ${
          expanded ? styles.collapseChevronOpen : ''
        }`}
        aria-hidden="true"
      >
        ↓
      </span>
    </button>
  );
}

function BlogList({
  appearances,
  flavor,
}: {
  appearances: Appearance[];
  flavor: string;
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const total = appearances.length;
  const collapsible = total > VISIBLE_THRESHOLD;
  const visible = expanded ? appearances : appearances.slice(0, VISIBLE_THRESHOLD);

  return (
    <section className={styles.section} aria-label="Blog posts">
      <SectionHeading flavor={flavor} title="Blog posts" count={total} />
      <ol className={styles.blogList}>
        {visible.map((a) => (
          <li key={a.url} className={styles.blogItem}>
            <Link to={a.url} className={styles.blogThumbWrap} aria-hidden="true" tabIndex={-1}>
              {a.image ? (
                <img src={a.image} alt="" className={styles.blogThumb} loading="lazy" />
              ) : (
                <span className={styles.blogThumbFallback} aria-hidden="true" />
              )}
            </Link>
            <div className={styles.blogText}>
              <Link to={a.url} className={styles.itemTitle}>
                {a.title}
              </Link>
              <time className={styles.itemDate} dateTime={a.date}>
                {formatDate(a.date)}
              </time>
            </div>
          </li>
        ))}
      </ol>
      {collapsible && (
        <CollapseToggle
          expanded={expanded}
          total={total}
          label="posts"
          onToggle={() => setExpanded((v) => !v)}
        />
      )}
    </section>
  );
}

function MeetingList({
  appearances,
  flavor,
}: {
  appearances: Appearance[];
  flavor: string;
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const total = appearances.length;
  const collapsible = total > VISIBLE_THRESHOLD;
  const visible = expanded ? appearances : appearances.slice(0, VISIBLE_THRESHOLD);

  return (
    <section className={styles.section} aria-label="Community calls">
      <SectionHeading flavor={flavor} title="Community calls" count={total} />
      <ol className={styles.indexList}>
        {visible.map((a) => (
          <li key={a.url} className={styles.indexItem}>
            <Link to={a.url} className={styles.indexRow}>
              <span className={styles.indexTitle}>{a.title}</span>
              <time className={styles.indexDate} dateTime={a.date}>
                {formatDate(a.date)}
              </time>
            </Link>
          </li>
        ))}
      </ol>
      {collapsible && (
        <CollapseToggle
          expanded={expanded}
          total={total}
          label="calls"
          onToggle={() => setExpanded((v) => !v)}
        />
      )}
    </section>
  );
}

const EXTERNAL_WORK_LABEL: Record<ExternalWorkType, string> = {
  writing: 'Writing',
  talk: 'Talk',
  podcast: 'Podcast',
  video: 'Video',
};

function ExternalWorksList({
  works,
  flavor,
}: {
  works?: ExternalWork[];
  flavor: string;
}): JSX.Element | null {
  const [expanded, setExpanded] = useState(false);
  if (!works || works.length === 0) return null;
  // Authors can add entries in any order; sort reverse-chronologically
  // here so the rendering is deterministic. Entries without a year sink
  // to the bottom (they're typically older items the author couldn't
  // pin to a specific year).
  const sorted = [...works].sort(
    (a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity),
  );
  const total = sorted.length;
  const collapsible = total > VISIBLE_THRESHOLD;
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_THRESHOLD);

  return (
    <section className={styles.section} aria-label="Around the web">
      <SectionHeading flavor={flavor} title="Around the web" count={total} />
      <ol className={styles.worksList}>
        {visible.map((w, i) => {
          const meta = [
            w.type ? EXTERNAL_WORK_LABEL[w.type] : null,
            w.venue,
            w.year ? String(w.year) : null,
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <li key={`${w.title}-${i}`} className={styles.worksItem}>
              {w.url ? (
                <Link to={w.url} className={styles.worksTitle}>
                  {w.title}
                </Link>
              ) : (
                <span className={styles.worksTitle}>{w.title}</span>
              )}
              {meta && <span className={styles.worksMeta}>{meta}</span>}
            </li>
          );
        })}
      </ol>
      {collapsible && (
        <CollapseToggle
          expanded={expanded}
          total={total}
          label="works"
          onToggle={() => setExpanded((v) => !v)}
        />
      )}
    </section>
  );
}

/** Section heading: an italic Caveat flavor word ("selected work",
 *  "on the call", "elsewhere") sitting above the more buttoned-up
 *  Lexend heading. The mix of typefaces gives a personal warmth
 *  without compromising the editorial register of the page. */
function SectionHeading({
  flavor,
  title,
  count,
}: {
  flavor: string;
  title: string;
  count: number;
}): JSX.Element {
  return (
    <header className={styles.sectionHeader}>
      <span className={styles.sectionFlavor}>{flavor}</span>
      <h2 className={styles.sectionTitle}>
        {title}
        <span className={styles.sectionCount} aria-label={`${count} items`}>
          {count}
        </span>
      </h2>
    </header>
  );
}

export default function PersonPage({ data }: { data: PersonPageData }): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const { person, org_url, blog_posts, community_meetings } = data;

  const pill = person.wasmcloud_role ? ROLE_PILLS[person.wasmcloud_role] : undefined;

  // Dedupe + preserve insertion order so any same_as[] order expressed
  // in people.json is respected. The full set still feeds the Person
  // JSON-LD `sameAs` — every entry is a valid identity signal for
  // search engines. The visible chips are filtered down to platforms
  // we know how to label (`platformLabel` returns null for the rest).
  const sameAs = new Set<string>();
  for (const link of person.same_as ?? []) sameAs.add(link);
  if (person.url) sameAs.add(person.url);
  const externalLinks = [...sameAs].filter((href) => platformLabel(href) !== null);

  const personLd = personJsonLd(data, siteUrl);

  const description = person.bio
    ? person.bio
    : `${person.name} — ${person.byline_title ?? 'wasmCloud contributor'}.`;

  // Split the name into first + last tokens for OpenGraph `profile:*`
  // metadata. Single-token names use the whole name as first_name and
  // omit last_name; works for "Aditya" or "Cher"-style entries.
  const nameTokens = person.name.split(/\s+/).filter(Boolean);
  const profileFirstName = nameTokens[0];
  const profileLastName = nameTokens.length > 1 ? nameTokens[nameTokens.length - 1] : undefined;

  return (
    <Layout title={person.name} description={description}>
      <Head>
        {/* Per-profile OpenGraph: override the site-default `og:type`
         *  ("website") with "profile" so social previews and entity
         *  graphs treat each page as a person rather than an article.
         *  When the profile has a portrait, override the site-wide
         *  og:image / twitter:image so LinkedIn / X / Slack rich-card
         *  previews show the person, not the generic wasmCloud logo. */}
        <meta property="og:type" content="profile" />
        {profileFirstName && (
          <meta property="profile:first_name" content={profileFirstName} />
        )}
        {profileLastName && (
          <meta property="profile:last_name" content={profileLastName} />
        )}
        {person.authors_key && (
          <meta property="profile:username" content={person.authors_key} />
        )}
        {person.image_url && (
          <meta property="og:image" content={person.image_url} />
        )}
        {person.image_url && (
          <meta name="twitter:image" content={person.image_url} />
        )}
        <script type="application/ld+json">{JSON.stringify(personLd)}</script>
      </Head>

      <article className={`container ${styles.container}`}>
        <Link to="/people/" className={styles.kicker}>
          wasmCloud community profiles
        </Link>

        <header className={styles.hero}>
          {/* Always render the avatar frame — when there's no portrait
           *  we fall back to a typographic initials mark so the hero
           *  grid stays balanced and the name doesn't get squeezed
           *  into the meta column. */}
          <div className={styles.avatarFrame}>
            {person.image_url ? (
              <img
                src={person.image_url}
                alt={person.name}
                className={styles.avatar}
                loading="eager"
              />
            ) : (
              <span className={styles.avatarInitials} aria-hidden="true">
                {initialsOf(person.name)}
              </span>
            )}
          </div>
          <div className={styles.heroMeta}>
            <h1 className={styles.name}>{person.name}</h1>

            <div className={styles.heroBadges}>
              {pill && (
                <span className={`${styles.rolePill} ${pill.className}`}>{pill.label}</span>
              )}
              {person.org && (
                <span className={styles.affiliation}>
                  {org_url ? (
                    <Link to={org_url} className={styles.orgLink}>
                      {person.org}
                    </Link>
                  ) : (
                    person.org
                  )}
                </span>
              )}
              {person.location && (
                <span className={styles.location}>{person.location}</span>
              )}
            </div>

            {externalLinks.length > 0 && (
              <ul className={styles.heroLinks} aria-label="External profiles">
                {externalLinks.map((href) => (
                  <li key={href}>
                    <ExternalLink href={href} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {person.bio && (
          <section className={styles.bioSection}>
            <p className={styles.bio}>{person.bio}</p>
          </section>
        )}

        {/* `knows_about` is consumed by the Person JSON-LD (the SEO
         *  signal that justifies maintaining the data) but is not
         *  rendered visually — it adds editorial noise without giving
         *  the reader anything to act on. The data stays in
         *  `people.json` and continues to feed schema.org `knowsAbout`. */}

        {blog_posts.length > 0 && (
          <BlogList appearances={blog_posts} flavor="selected work" />
        )}

        {community_meetings.length > 0 && (
          <MeetingList appearances={community_meetings} flavor="on the call" />
        )}

        <ExternalWorksList works={person.external_works} flavor="elsewhere" />
      </article>
    </Layout>
  );
}
