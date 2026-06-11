import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import JsonLd from '@theme/wasmcloud/json-ld';
import {
  buildEntityNodes,
  buildEntityRefs,
} from '@theme/wasmcloud/structured-data/entities';

/**
 * Per M4 of the structured-data spike: emit `TechArticle` JSON-LD on every
 * doc page (current + versioned). Defaults are sensible enough that
 * existing docs gain valid schema without frontmatter changes; the
 * frontmatter fields (`proficiency`, `dependencies`, `languages`,
 * `platforms`, `about`, `mentions`) enrich the emitted payload when
 * present.
 *
 * Author defaults to the wasmCloud project Organization (`@id` reference).
 * A frontmatter `author:` override is supported for personally-authored
 * docs.
 */

const PROJECT_ORG_ID = 'https://wasmcloud.com/#organization';
const PUBLISHER_REF = { '@id': PROJECT_ORG_ID } as const;

type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Expert';
const VALID_PROFICIENCIES: ReadonlySet<ProficiencyLevel> = new Set([
  'Beginner',
  'Intermediate',
  'Expert',
]);

type Interactivity = 'expositive' | 'active';
const VALID_INTERACTIVITIES: ReadonlySet<Interactivity> = new Set([
  'expositive',
  'active',
]);

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value.filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );
  return cleaned.length > 0 ? cleaned : undefined;
}

function pickEnum<T extends string>(
  value: unknown,
  validSet: ReadonlySet<T>,
  fallback: T,
): T {
  return typeof value === 'string' && validSet.has(value as T)
    ? (value as T)
    : fallback;
}

/**
 * Build a Person (or Person[]) entity from the frontmatter `author:` field.
 * Supports a bare string (`author: Brooks Townsend`), an object
 * (`author: { name: ..., title: ..., url: ..., image: ... }`), or an array
 * of either. Returns the wasmCloud project Organization reference (the
 * default) when no frontmatter `author:` is present or when nothing
 * parseable can be extracted.
 */
function buildOnePerson(raw: unknown): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    const name = raw.trim();
    return name ? { '@type': 'Person', name } : null;
  }
  if (raw != null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const out: Record<string, unknown> = { '@type': 'Person' };
    if (typeof obj.name === 'string' && obj.name.trim()) out.name = obj.name.trim();
    if (typeof obj.title === 'string' && obj.title.trim())
      out.jobTitle = (obj.title as string).trim();
    if (typeof obj.url === 'string' && obj.url.trim()) out.url = (obj.url as string).trim();
    if (typeof obj.image === 'string' && obj.image.trim())
      out.image = (obj.image as string).trim();
    // Need at least one property beyond `@type`.
    return Object.keys(out).length > 1 ? out : null;
  }
  return null;
}

function buildDocAuthor(fm: Record<string, unknown>): unknown {
  const raw = fm.author;
  if (raw == null) return PUBLISHER_REF;
  const items = Array.isArray(raw) ? raw : [raw];
  const persons = items
    .map(buildOnePerson)
    .filter((p): p is Record<string, unknown> => p !== null);
  if (persons.length === 0) return PUBLISHER_REF;
  if (persons.length === 1) return persons[0];
  return persons;
}

function articleSectionFor(permalink: string): string | undefined {
  const trimmed = permalink.replace(/^\/+|\/+$/g, '');
  const segments = trimmed.split('/');
  // /docs/kubernetes-operator/index/  → first non-`docs` segment = "kubernetes-operator"
  // /docs/v1/...                       → version segment skipped, picks the section after
  const first = segments[0];
  if (first !== 'docs') return first || undefined;
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;
    // Skip version segments like `v1` or `0.82`.
    if (/^v?\d+(\.\d+)*$/.test(seg)) continue;
    return seg;
  }
  return undefined;
}

export default function DocPageSchema(): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const docContext = useDoc();
  const { metadata, frontMatter } = docContext;
  // Docusaurus's frontMatter type doesn't enumerate the M4 fields; cast to a
  // permissive record so we can read them without TS friction. Validation
  // happens per-field below.
  const fm = frontMatter as unknown as Record<string, unknown>;

  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const canonicalUrl = `${siteUrl}${metadata.permalink}`;
  const headline = (fm.title as string) || metadata.title || '';
  if (!headline) return null;

  const description = (fm.description as string) || metadata.description;

  // Docusaurus exposes `lastUpdatedAt` as a unix timestamp when
  // `showLastUpdateTime` is enabled (M1).
  // Docusaurus's `lastUpdatedAt` is already a JS Date.getTime()-shaped
  // millisecond timestamp, NOT a unix-seconds value. See blog-post-schema.tsx
  // for the same gotcha.
  const lastUpdated = (metadata as { lastUpdatedAt?: number }).lastUpdatedAt;
  const dateModified =
    typeof lastUpdated === 'number' && lastUpdated > 0
      ? new Date(lastUpdated).toISOString()
      : undefined;
  const datePublished =
    (typeof fm.date === 'string' && fm.date) ||
    (fm.date instanceof Date ? (fm.date as Date).toISOString() : undefined);

  const proficiency = pickEnum<ProficiencyLevel>(
    fm.proficiency,
    VALID_PROFICIENCIES,
    'Intermediate',
  );
  const interactivity = pickEnum<Interactivity>(
    fm.interactivity,
    VALID_INTERACTIVITIES,
    'expositive',
  );
  const dependencies =
    typeof fm.dependencies === 'string' ? fm.dependencies : undefined;
  const languages = stringArray(fm.languages);
  const platforms = stringArray(fm.platforms);
  const tags = stringArray(fm.tags);

  // Version comes from Docusaurus versioned-docs metadata.
  const version = (metadata as { version?: string }).version;

  const entityRefs = buildEntityRefs(fm);
  const entityNodes = buildEntityNodes(fm);

  // Per the Ahrefs audit fix plan:
  //   - `applicationCategory` is SoftwareApplication-only — drop from TechArticle.
  //   - `runtimePlatform` is SoftwareApplication-only — drop. Fold the
  //     `platforms:` frontmatter values into `keywords` so we don't lose
  //     the topical signal.
  //   - `programmingLanguage` is SoftwareSourceCode/SoftwareApplication-
  //     only — drop. Fold `languages:` into `keywords` the same way.
  const keywordsList: string[] = [];
  if (tags) keywordsList.push(...tags);
  if (languages) keywordsList.push(...languages);
  if (platforms) keywordsList.push(...platforms);
  // De-dupe while preserving order
  const seenKw = new Set<string>();
  const keywords = keywordsList.filter((k) => {
    if (seenKw.has(k)) return false;
    seenKw.add(k);
    return true;
  });

  const articleSection = articleSectionFor(metadata.permalink);

  // Google's Article rich-result wants an `image`. Doc pages don't
  // typically carry their own hero, so we prefer an explicit frontmatter
  // `image:` if set and fall back to the wasmCloud social card. The
  // fallback is a real 1200x630 PNG hosted on the site so the rich-result
  // image requirement (min 50K pixels, crawlable) is satisfied.
  const FALLBACK_IMAGE = `${siteUrl}/logo/wasmcloud-social.png`;
  const fmImage = typeof fm.image === 'string' && fm.image.trim() ? fm.image.trim() : undefined;
  const image =
    fmImage && (fmImage.startsWith('http://') || fmImage.startsWith('https://'))
      ? fmImage
      : fmImage
        ? `${siteUrl}${fmImage.startsWith('/') ? '' : '/'}${fmImage.replace(/^\.\/+/, '')}`
        : FALLBACK_IMAGE;

  const article: Record<string, unknown> = {
    '@type': 'TechArticle',
    '@id': `${canonicalUrl}#article`,
    headline,
    ...(description && { description }),
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: 'en',
    isAccessibleForFree: true,
    image,
    author: buildDocAuthor(fm),
    publisher: PUBLISHER_REF,
    audience: { '@type': 'Audience', audienceType: 'Developer' },
    proficiencyLevel: proficiency,
    educationalLevel: proficiency,
    interactivityType: interactivity,
    ...(dependencies && { dependencies }),
    ...(keywords.length > 0 && { keywords }),
    ...(version && { version }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(entityRefs.about && { about: entityRefs.about }),
    ...(entityRefs.mentions && { mentions: entityRefs.mentions }),
    ...(articleSection && { articleSection }),
  };

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
