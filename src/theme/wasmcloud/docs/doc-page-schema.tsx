import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import JsonLd from '@theme/wasmcloud/json-ld';
import { buildEntityRefs } from '@theme/wasmcloud/structured-data/entities';

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

  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline,
    ...(description && { description }),
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: 'en',
    isAccessibleForFree: true,
    author: PUBLISHER_REF,
    publisher: PUBLISHER_REF,
    audience: { '@type': 'Audience', audienceType: 'Developer' },
    applicationCategory: 'DeveloperApplication',
    proficiencyLevel: proficiency,
    educationalLevel: proficiency,
    interactivityType: interactivity,
    ...(dependencies && { dependencies }),
    ...(languages && { programmingLanguage: languages }),
    ...(platforms && { runtimePlatform: platforms }),
    ...(tags && { keywords: tags }),
    ...(version && { version }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(entityRefs.about && { about: entityRefs.about }),
    ...(entityRefs.mentions && { mentions: entityRefs.mentions }),
  };

  const articleSection = articleSectionFor(metadata.permalink);
  if (articleSection) payload.articleSection = articleSection;

  return <JsonLd data={payload} />;
}
