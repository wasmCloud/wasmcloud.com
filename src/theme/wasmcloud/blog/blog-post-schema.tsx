import React from 'react';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import JsonLd from '@theme/wasmcloud/json-ld';
import {
  buildEntityNodes,
  buildEntityRefs,
} from '@theme/wasmcloud/structured-data/entities';
// Community transcript pages inherit about/mentions from their parent
// landing page via this map (see video-seo.tsx + the prebuild generator).
// On non-community pages and on landing pages the map is unused.
import transcriptInheritance from '@site/src/data/transcript-inheritance.json';

type InheritedRefs = { about?: string; mentions?: string[] };
const TRANSCRIPT_INHERITANCE: Record<string, InheritedRefs> =
  (transcriptInheritance as { entries?: Record<string, InheritedRefs> }).entries ?? {};

/**
 * Per M2 of the structured-data spike: emit the full Article-family schema
 * for every blog post, with `@type` driven by frontmatter `schema_type`
 * (selector pattern: BlogPosting | NewsArticle | TechArticle, default
 * BlogPosting).
 *
 * This component supersedes Docusaurus's default `BlogPostPageStructuredData`
 * (which only emits a fixed BlogPosting with no support for the selector,
 * `about`/`mentions` entity refs, or NewsArticle-restricted `speakable`).
 * The default is mounted in our `BlogPostPage` swizzle; if both this and
 * the default ship on the same page, Google will see two Article schemas —
 * remove the default's `<BlogPostPageStructuredData />` from the page
 * swizzle when shipping this one.
 */

const PROJECT_ORG_ID = 'https://wasmcloud.com/#organization';
const PUBLISHER_REF = { '@id': PROJECT_ORG_ID } as const;

type SchemaType = 'BlogPosting' | 'NewsArticle' | 'TechArticle';

const VALID_SCHEMA_TYPES: ReadonlySet<SchemaType> = new Set([
  'BlogPosting',
  'NewsArticle',
  'TechArticle',
]);

function resolveSchemaType(raw: unknown): SchemaType {
  if (typeof raw === 'string' && VALID_SCHEMA_TYPES.has(raw as SchemaType)) {
    return raw as SchemaType;
  }
  return 'BlogPosting';
}

type AuthorMetadata = {
  key?: string;
  name?: string;
  title?: string;
  url?: string;
  imageURL?: string;
  socials?: Record<string, string>;
};

type PeoplePagesData = {
  profileSlugs: string[];
  authorsKeyToSlug: Record<string, string>;
};

function buildAuthors(
  metadata: ReturnType<typeof useBlogPost>['metadata'],
  peoplePages: PeoplePagesData | undefined,
  siteUrl: string,
) {
  // Docusaurus's BlogPostMetadata exposes authors as objects shaped by
  // `blog/authors.yml`. Build Person entities per Google's Article guidance:
  // separate Person object per author, name only in `.name`, jobTitle for
  // role, sameAs for external profile URLs.
  //
  // For authors who have a `/people/<slug>/` profile page (registered by
  // people-pages-plugin), emit an `@id` REFERENCE to the canonical Person
  // node at `${siteUrl}/people/<slug>/#person` instead of an inline copy.
  // The profile page is the single source of truth — `knowsAbout`,
  // `worksFor`, full `sameAs`, `subjectOf` all live there. Inline copies
  // would create competing Person entities for the same human, which is
  // exactly what Google's E-E-A-T pass flags.
  //
  // For authors WITHOUT a profile page (Caz, emeritus, external
  // contributors), keep emitting an inline Person — the canonical node
  // doesn't exist on-site to reference.
  const authors = (metadata as { authors?: AuthorMetadata[] }).authors ?? [];
  if (!Array.isArray(authors) || authors.length === 0) {
    return undefined;
  }
  return authors
    .filter((a): a is AuthorMetadata => a != null && typeof a === 'object')
    .map((a) => {
      const profileSlug = a.key ? peoplePages?.authorsKeyToSlug[a.key] : undefined;
      if (profileSlug) {
        // @id reference — the full Person lives at /people/<slug>/. Keep
        // `name` for graph readability (Google docs explicitly allow it on
        // @id refs and it helps validators), drop everything else.
        return {
          '@type': 'Person',
          '@id': `${siteUrl}/people/${profileSlug}/#person`,
          ...(a.name && { name: a.name }),
        };
      }
      const out: Record<string, unknown> = {
        '@type': 'Person',
        ...(a.name && { name: a.name }),
      };
      if (a.title) out.jobTitle = a.title;
      if (a.url) out.url = a.url;
      if (a.imageURL) out.image = a.imageURL;
      // `socials` may carry github/linkedin/x keys. Promote to sameAs[].
      if (a.socials && typeof a.socials === 'object') {
        const sameAs = Object.values(a.socials).filter(
          (v): v is string => typeof v === 'string' && v.length > 0,
        );
        if (sameAs.length > 0) out.sameAs = sameAs;
      }
      return out;
    });
}

function getWordCount(metadata: ReturnType<typeof useBlogPost>['metadata']): number | undefined {
  // Docusaurus exposes readingTime (in minutes). Convert back to a coarse
  // word-count estimate at ~225 wpm (Docusaurus's default reading-speed
  // assumption). This is approximate but better than omitting the field.
  const readingTime = (metadata as { readingTime?: number }).readingTime;
  if (typeof readingTime !== 'number') return undefined;
  return Math.round(readingTime * 225);
}

function getKeywords(frontMatter: Record<string, unknown>): string[] | undefined {
  const raw = frontMatter.tags;
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      out.push(item.trim());
    } else if (
      item &&
      typeof item === 'object' &&
      typeof (item as { label?: string }).label === 'string'
    ) {
      out.push((item as { label: string }).label);
    }
  }
  return out.length > 0 ? out : undefined;
}

/**
 * Detect whether an image path follows the M3 hero-source convention
 * (`.../hero.png`, `.../hero.jpg`, etc.). When it does, the build pipeline
 * has produced sibling `hero-16x9.webp` / `hero-4x3.webp` / `hero-1x1.webp`
 * variants that we point Google at for the Article rich-result image
 * requirement (multiple ratios at min 50K pixels each).
 */
const HERO_SOURCE_RE = /\/hero\.(?:png|jpg|jpeg|webp)$/i;

function buildImageProperty(
  frontMatter: Record<string, unknown>,
  metadata: ReturnType<typeof useBlogPost>['metadata'],
  siteUrl: string,
): string[] | undefined {
  // Prefer the explicit `image` frontmatter (the M3 transform produces 16:9
  // / 4:3 / 1:1 WebP variants next to the source hero); fall back to
  // Docusaurus's resolved frontMatter.image.
  const raw = (frontMatter.image ?? (metadata as { frontMatter?: Record<string, unknown> }).frontMatter?.image) as
    | string
    | string[]
    | undefined;
  if (!raw) return undefined;
  const resolve = (rawUrl: string): string | undefined => {
    if (!rawUrl) return undefined;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    // Strip Docusaurus-relative prefixes like `./images/foo.png`. Article
    // schema requires absolute, crawlable URLs.
    let normalized = rawUrl.replace(/^\.\/+/, '');
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
    return `${siteUrl}${normalized}`;
  };

  // Single string image that follows the hero convention → derive the 3-ratio
  // WebP siblings so Article rich-result image multi-ratio requirement is met.
  if (typeof raw === 'string' && HERO_SOURCE_RE.test(raw)) {
    const baseDir = raw.replace(HERO_SOURCE_RE, '');
    const variants = ['16x9', '4x3', '1x1'].map((r) =>
      resolve(`${baseDir}/hero-${r}.webp`),
    );
    return variants.filter((u): u is string => typeof u === 'string');
  }

  const list = Array.isArray(raw) ? raw : [raw];
  const resolved = list
    .map((u) => resolve(u))
    .filter((u): u is string => typeof u === 'string' && u.length > 0);
  return resolved.length > 0 ? resolved : undefined;
}

export default function BlogPostSchema(): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const { metadata } = useBlogPost();
  const peoplePages = usePluginData('people-pages-plugin') as
    | PeoplePagesData
    | undefined;
  const { frontMatter, permalink, title, description, date, unlisted } = metadata;
  const siteUrl = siteConfig.url.replace(/\/$/, '');

  // Unlisted posts should not be indexed; skip schema emission.
  if (unlisted) return null;

  const schemaType = resolveSchemaType(
    (frontMatter as { schema_type?: string }).schema_type,
  );
  const canonicalUrl = `${siteUrl}${permalink}`;
  const datePublished = typeof date === 'string' ? date : date instanceof Date ? date.toISOString() : undefined;
  // Docusaurus's `lastUpdatedAt` is already a JS Date.getTime()-shaped
  // millisecond timestamp, NOT a unix-seconds value. Don't multiply by 1000
  // — that produces year 58000+ dates and trashes the rich result.
  const lastUpdated = (metadata as { lastUpdatedAt?: number }).lastUpdatedAt;
  const dateModified =
    typeof lastUpdated === 'number' && lastUpdated > 0
      ? new Date(lastUpdated).toISOString()
      : datePublished;

  const authors = buildAuthors(metadata, peoplePages, siteUrl);
  const wordCount = getWordCount(metadata);
  const keywords = getKeywords(frontMatter as Record<string, unknown>);
  const image = buildImageProperty(
    frontMatter as Record<string, unknown>,
    metadata,
    siteUrl,
  );
  // Community transcript pages don't carry their own about/mentions
  // (those refs live on the parent landing page). Inherit from the
  // prebuild-generated map so the transcript's BlogPosting/Article
  // node carries the same entity graph as its meeting page.
  const permalinkWithSlash = permalink.endsWith('/') ? permalink : permalink + '/';
  const inherited =
    TRANSCRIPT_INHERITANCE[permalink] || TRANSCRIPT_INHERITANCE[permalinkWithSlash];
  const fmForRefs: Record<string, unknown> = inherited
    ? {
        ...(frontMatter as Record<string, unknown>),
        ...(((frontMatter as { about?: unknown }).about === undefined &&
          inherited.about) ? { about: inherited.about } : {}),
        ...(!Array.isArray((frontMatter as { mentions?: unknown }).mentions) &&
        inherited.mentions
          ? { mentions: inherited.mentions }
          : {}),
      }
    : (frontMatter as Record<string, unknown>);
  const entityRefs = buildEntityRefs(fmForRefs);
  const entityNodes = buildEntityNodes(fmForRefs);

  // M2 risk #12: Speakable is restricted to NewsArticle. Honor the
  // `speakable: true` frontmatter only when the post is typed NewsArticle.
  const speakableFlag =
    (frontMatter as { speakable?: boolean }).speakable === true &&
    schemaType === 'NewsArticle';

  const discussionUrl = (frontMatter as { discussionUrl?: string }).discussionUrl;
  const articleSection = (frontMatter as { articleSection?: string }).articleSection;

  const article: Record<string, unknown> = {
    '@type': schemaType,
    '@id': `${canonicalUrl}#article`,
    headline: title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: 'en',
    isAccessibleForFree: true,
    audience: { '@type': 'Audience', audienceType: 'Developer' },
    publisher: PUBLISHER_REF,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    // `author` is technically optional on Article-family schemas, but
    // Google's Rich Results Test flags its absence on every Article it
    // sees. Community transcript pages don't carry personal `authors:`
    // in frontmatter — for those we fall back to the wasmCloud project
    // org so the field is always present and the rich-result is eligible.
    author: authors ?? PUBLISHER_REF,
    ...(image && { image }),
    ...(keywords && { keywords }),
    ...(wordCount !== undefined && { wordCount }),
    ...(articleSection && { articleSection }),
    ...(discussionUrl && { discussionUrl }),
    ...(entityRefs.about && { about: entityRefs.about }),
    ...(entityRefs.mentions && { mentions: entityRefs.mentions }),
  };

  if (speakableFlag) {
    article.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article > header', 'article > section:first-of-type'],
    };
  }

  // Wrap article + referenced entities in a single @graph so the @id
  // refs in about/mentions resolve within the same payload (avoids the
  // Ahrefs "dangling reference" notice).
  const payload =
    entityNodes.length > 0
      ? {
          '@context': 'https://schema.org',
          '@graph': [article, ...entityNodes],
        }
      : {
          '@context': 'https://schema.org',
          ...article,
        };

  return <JsonLd data={payload} />;
}
