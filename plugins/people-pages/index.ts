/**
 * people-pages Docusaurus plugin
 *
 * Generates one `/people/<slug>/` route per qualifying entry in
 * `src/data/people.json`. A person qualifies when:
 *   1. `wasmcloud_role: 'maintainer'` (currently active maintainers only;
 *      emeritus / contributor / community entries are scoped out for v1),
 *   2. AND they have either an `authors_key` matching at least one blog
 *      post's `authors:` frontmatter, OR a `slug` matching at least one
 *      community meeting's `speakers:` frontmatter.
 *
 * Each route receives:
 *   - The person record from people.json (identity, role, links).
 *   - The org affiliation lookup (so the page can render Organization
 *     JSON-LD edges without re-reading people.json).
 *   - Derived appearance feeds: blog_posts (authored by them) and
 *     community_meetings (where they spoke), each sorted newest-first.
 *
 * Also exposes the qualifying set as global plugin data
 * (`people-pages-plugin.profileSlugs`) so other components (meeting
 * speaker chips, blog post bylines) can decide whether to render a name
 * as a `/people/<slug>` link.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import type { LoadContext, Plugin } from '@docusaurus/types';

interface RawPerson {
  slug: string;
  name: string;
  authors_key?: string;
  byline_title?: string;
  image_url?: string;
  url?: string;
  org?: string;
  wasmcloud_role?: 'maintainer' | 'contributor' | 'community' | 'emeritus';
  aliases?: string[];
  bio?: string;
  location?: string;
  same_as?: string[];
  knows_about?: string[];
  external_works?: Array<{
    title: string;
    venue?: string;
    year?: number;
    url?: string;
    type?: 'writing' | 'talk' | 'podcast' | 'video';
  }>;
}

interface RawOrg {
  url: string;
}

interface PeopleJson {
  people: RawPerson[];
  organizations: Record<string, RawOrg>;
}

export interface Appearance {
  /** Display title (post title or meeting title). */
  title: string;
  /** Canonical Docusaurus permalink, e.g. `/blog/wasmcloud-2.2.0/`. */
  url: string;
  /** ISO-8601 date string (YYYY-MM-DD), used for sorting + display. */
  date: string;
  /** Absolute URL to the post/meeting hero image, when one is set in
   *  frontmatter. Blog post relative paths (`./images/foo.webp`) are
   *  resolved to `/blog/<dirname>/images/foo.webp`. */
  image?: string;
  /** One-line summary from the post/meeting frontmatter (`description:`).
   *  Used to populate VideoObject.description / Article.description in
   *  the Person page's `subjectOf` JSON-LD — both fields are required
   *  by Google's rich-results validator. */
  description?: string;
}

export interface PersonPageData {
  person: RawPerson;
  /** Org URL if `person.org` matches an entry in the organizations map. */
  org_url?: string;
  blog_posts: Appearance[];
  community_meetings: Appearance[];
}

/** Compact per-person record consumed by the `/people/` index page.
 *  Only the fields the directory row needs — full appearance lists stay
 *  on the per-profile data files. */
export interface IndexEntry {
  slug: string;
  name: string;
  image_url?: string;
  org?: string;
  org_url?: string;
  wasmcloud_role?: RawPerson['wasmcloud_role'];
  blog_post_count: number;
  community_meeting_count: number;
  external_works_count: number;
}

export interface PeopleIndexPageData {
  /** Sorted entries ready to render — order is alphabetical by slug,
   *  which conveniently happens to be first-name order. */
  entries: IndexEntry[];
}

export interface PeoplePagesGlobalData {
  /** Slugs that have a `/people/<slug>` route. Drives link decisions
   *  in meeting-speakers chips and blog post byline swizzles. */
  profileSlugs: string[];
  /** Reverse map: authors.yml key -> people.json slug for blog byline
   *  swizzles that only know the authors_key. */
  authorsKeyToSlug: Record<string, string>;
}

interface LoadedContent {
  routes: PersonPageData[];
  index: PeopleIndexPageData;
  globalData: PeoplePagesGlobalData;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/;
const MEETING_RE = /^(\d{4}-\d{2}-\d{2})-community-meeting\.mdx$/;
const BLOG_POST_DATE_RE = /^(\d{4}-\d{2}-\d{2})-/;

async function readFrontmatter(filePath: string): Promise<Record<string, unknown> | null> {
  const text = await fs.readFile(filePath, 'utf8');
  const match = FRONTMATTER_RE.exec(text);
  if (!match) return null;
  try {
    const fm = yaml.load(match[1]);
    return (fm && typeof fm === 'object') ? (fm as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

/**
 * Derive the canonical Docusaurus permalink for a blog post. Honours
 * explicit `slug:` frontmatter; otherwise strips the leading date prefix
 * from the directory name and uses the rest. Matches Docusaurus's
 * default blog routing (`/blog/<slug>/`).
 */
function blogPermalink(dirName: string, frontmatter: Record<string, unknown>): string {
  const slugFm = typeof frontmatter.slug === 'string' ? frontmatter.slug : null;
  if (slugFm) {
    return slugFm.startsWith('/') ? slugFm : `/blog/${slugFm}/`;
  }
  const stripped = dirName.replace(BLOG_POST_DATE_RE, '');
  return `/blog/${stripped}/`;
}

/**
 * Resolve an `image:` frontmatter value into an absolute URL the dev
 * server / production build will actually serve.
 *
 *   - `./foo.webp`            → `<baseDir>/foo.webp`
 *   - `images/foo.webp`       → `<baseDir>/images/foo.webp` (no `./` prefix)
 *   - `https://example.com/…` → unchanged
 *   - `/already/absolute.png` → unchanged
 *
 * Returns `undefined` when the frontmatter value isn't a string.
 */
function resolveImage(raw: unknown, baseDir: string): string | undefined {
  if (typeof raw !== 'string' || raw.length === 0) return undefined;
  if (/^https?:\/\//.test(raw) || raw.startsWith('/')) return raw;
  const rel = raw.replace(/^\.\//, '');
  return `${baseDir}/${rel}`;
}

/** Walk `blog/` and `community/`, extracting authors / speakers per post. */
async function collectAppearances(repoRoot: string) {
  const blogDir = path.join(repoRoot, 'blog');
  const communityDir = path.join(repoRoot, 'community');

  // authorKey -> Appearance[]
  const byAuthor: Record<string, Appearance[]> = {};
  // speakerSlug -> Appearance[]
  const bySpeaker: Record<string, Appearance[]> = {};

  // Blog posts live in dated subdirectories (`blog/<date>-<slug>/index.mdx`).
  // Skip underscore-prefixed dirs (e.g. `_template/`) — Docusaurus's blog
  // plugin ignores them and so should the appearance scan.
  const blogEntries = await fs.readdir(blogDir, { withFileTypes: true });
  for (const entry of blogEntries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_')) continue;
    const dirPath = path.join(blogDir, entry.name);
    const indexCandidates = ['index.mdx', 'index.md'];
    let indexPath: string | null = null;
    for (const c of indexCandidates) {
      try {
        await fs.access(path.join(dirPath, c));
        indexPath = path.join(dirPath, c);
        break;
      } catch {
        // try next
      }
    }
    if (!indexPath) continue;

    const fm = await readFrontmatter(indexPath);
    if (!fm) continue;
    const authors = asStringArray(fm.authors);
    if (authors.length === 0) continue;

    const dateMatch = BLOG_POST_DATE_RE.exec(entry.name);
    if (!dateMatch) continue;
    const title = typeof fm.title === 'string' ? fm.title : entry.name;
    const url = blogPermalink(entry.name, fm);
    // Docusaurus prefers `date:` frontmatter over the directory prefix —
    // some posts pin a different publish date (see e.g.
    // 2025-08-26-setup-wash/index.mdx with date: "2025-08-20").
    // Fall back to the dirname date when the frontmatter omits it.
    const fmDate = typeof fm.date === 'string' ? fm.date : null;
    const date = fmDate && /^\d{4}-\d{2}-\d{2}/.test(fmDate)
      ? fmDate.slice(0, 10)
      : dateMatch[1];

    // Resolve the post's hero image. `image:` is conventionally a
    // co-located relative path (`./images/foo.webp`). Docusaurus
    // processes those through webpack at MDX render time, so the URL
    // isn't known here — instead we point at the copy made by
    // `scripts/generate-blog-thumbnails.mjs`, which mirrors the relative
    // path under `static/blog-thumbs/<dir>/`. Absolute URLs pass through.
    const image = resolveImage(fm.image, `/blog-thumbs/${entry.name}`);
    const description = typeof fm.description === 'string' ? fm.description : undefined;

    const appearance: Appearance = {
      title,
      url,
      date,
      ...(image && { image }),
      ...(description && { description }),
    };
    for (const key of authors) {
      (byAuthor[key] ??= []).push(appearance);
    }
  }

  // Community meetings live as flat `<date>-community-meeting.mdx` files.
  const meetingEntries = await fs.readdir(communityDir);
  for (const file of meetingEntries) {
    const match = MEETING_RE.exec(file);
    if (!match) continue;
    const fm = await readFrontmatter(path.join(communityDir, file));
    if (!fm) continue;
    const speakers = asStringArray(fm.speakers);
    if (speakers.length === 0) continue;

    const date = match[1];
    const title = typeof fm.title === 'string' ? fm.title : `Community Call ${date}`;
    const slug = typeof fm.slug === 'string' ? fm.slug : `${date}-community-meeting`;
    const url = `/community/${slug}/`;
    const image = resolveImage(fm.image, `/community`);
    const description = typeof fm.description === 'string' ? fm.description : undefined;

    const appearance: Appearance = {
      title,
      url,
      date,
      ...(image && { image }),
      ...(description && { description }),
    };
    for (const speakerSlug of speakers) {
      (bySpeaker[speakerSlug] ??= []).push(appearance);
    }
  }

  // Sort each list newest-first for stable rendering.
  const sortDesc = (a: Appearance, b: Appearance) => b.date.localeCompare(a.date);
  for (const list of Object.values(byAuthor)) list.sort(sortDesc);
  for (const list of Object.values(bySpeaker)) list.sort(sortDesc);

  return { byAuthor, bySpeaker };
}

export default async function peoplePagesPlugin(
  context: LoadContext,
): Promise<Plugin<LoadedContent>> {
  return {
    name: 'people-pages-plugin',

    async loadContent() {
      const repoRoot = context.siteDir;
      const peopleJsonPath = path.join(repoRoot, 'src', 'data', 'people.json');
      const peopleJson = JSON.parse(await fs.readFile(peopleJsonPath, 'utf8')) as PeopleJson;

      const { byAuthor, bySpeaker } = await collectAppearances(repoRoot);

      const routes: PersonPageData[] = [];
      const indexEntries: IndexEntry[] = [];
      const profileSlugs: string[] = [];
      const authorsKeyToSlug: Record<string, string> = {};

      for (const person of peopleJson.people) {
        // Scope filter: only currently active maintainers.
        if (person.wasmcloud_role !== 'maintainer') continue;

        const blogPosts = person.authors_key ? (byAuthor[person.authors_key] ?? []) : [];
        const communityMeetings = bySpeaker[person.slug] ?? [];

        // Eligibility filter: at least one published surface.
        if (blogPosts.length === 0 && communityMeetings.length === 0) continue;

        profileSlugs.push(person.slug);
        if (person.authors_key) {
          authorsKeyToSlug[person.authors_key] = person.slug;
        }

        const orgUrl =
          person.org && peopleJson.organizations[person.org]?.url
            ? peopleJson.organizations[person.org].url
            : undefined;

        routes.push({
          person,
          ...(orgUrl !== undefined && { org_url: orgUrl }),
          blog_posts: blogPosts,
          community_meetings: communityMeetings,
        });

        indexEntries.push({
          slug: person.slug,
          name: person.name,
          ...(person.image_url && { image_url: person.image_url }),
          ...(person.org && { org: person.org }),
          ...(orgUrl !== undefined && { org_url: orgUrl }),
          ...(person.wasmcloud_role && { wasmcloud_role: person.wasmcloud_role }),
          blog_post_count: blogPosts.length,
          community_meeting_count: communityMeetings.length,
          external_works_count: person.external_works?.length ?? 0,
        });
      }

      // Sort directory entries alphabetically by slug (== first name
      // for the current set, since slugs are first-last). Stable and
      // predictable for visitors browsing the index.
      indexEntries.sort((a, b) => a.slug.localeCompare(b.slug));

      return {
        routes,
        index: { entries: indexEntries },
        globalData: { profileSlugs, authorsKeyToSlug },
      };
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute, setGlobalData } = actions;
      setGlobalData(content.globalData);

      // Most recent appearance date for a profile, as a millisecond
      // timestamp. These routes are synthesized via addRoute and have no
      // source file, so the sitemap plugin can't derive <lastmod> on its
      // own — we feed it `metadata.lastUpdatedAt` (which it reads before
      // falling back to a git lookup). A profile's content effectively
      // changes when the person gains a new blog post or meeting, so the
      // newest appearance is the honest freshness signal.
      const latestAppearanceMs = (route: PersonPageData): number | undefined => {
        const ms = [...route.blog_posts, ...route.community_meetings]
          .map((a) => new Date(a.date).getTime())
          .filter((t) => Number.isFinite(t));
        return ms.length ? Math.max(...ms) : undefined;
      };

      let indexLatestMs: number | undefined;

      for (const route of content.routes) {
        const data = await createData(
          `person-${route.person.slug}.json`,
          JSON.stringify(route, null, 2),
        );
        const lastUpdatedAt = latestAppearanceMs(route);
        if (lastUpdatedAt !== undefined) {
          indexLatestMs =
            indexLatestMs === undefined ? lastUpdatedAt : Math.max(indexLatestMs, lastUpdatedAt);
        }
        addRoute({
          path: `/people/${route.person.slug}/`,
          component: '@site/src/components/PersonPage/index.tsx',
          modules: { data },
          ...(lastUpdatedAt !== undefined && { metadata: { lastUpdatedAt } }),
          exact: true,
        });
      }

      // Directory index at /people/. Renders the entries list above
      // with a sibling React component.
      const indexData = await createData(
        'people-index.json',
        JSON.stringify(content.index, null, 2),
      );
      addRoute({
        path: '/people/',
        component: '@site/src/components/PeopleIndexPage/index.tsx',
        modules: { data: indexData },
        // The directory listing is "current" as of its most recently
        // active profile.
        ...(indexLatestMs !== undefined && { metadata: { lastUpdatedAt: indexLatestMs } }),
        exact: true,
      });
    },

    getPathsToWatch() {
      return [
        path.join(context.siteDir, 'src/data/people.json'),
        path.join(context.siteDir, 'blog/*/index.mdx'),
        path.join(context.siteDir, 'blog/*/index.md'),
        path.join(context.siteDir, 'community/*-community-meeting.mdx'),
      ];
    },
  };
}
