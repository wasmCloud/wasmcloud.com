/**
 * Entity resolver for `about` / `mentions` Schema.org references.
 *
 * Per M12 of the structured-data spike: all Article-family pages
 * (BlogPosting, NewsArticle, TechArticle, transcript Article) emit
 * `about: { @id }` (single primary entity) and `mentions: [{ @id }]`
 * (array of secondary entities) sourced from frontmatter slugs that
 * resolve against `src/data/entities.json`.
 *
 * Frontmatter-explicit only; the body-scan fallback was rejected during
 * planning because text-frequency entity matching produces brittle false
 * positives that hide errors. Missing values surface as M10 lint warnings.
 */
import entitiesJson from '@site/src/data/entities.json';

type EntityData = {
  '@id': string;
  '@type': string;
  name: string;
  alternateName?: string[];
  description?: string;
  sameAs?: string[];
  url?: string;
};

type EntitiesFile = {
  entities: Record<string, EntityData>;
};

const ENTITIES: Record<string, EntityData> = (entitiesJson as unknown as EntitiesFile)
  .entities;

/** Reference form emitted in JSON-LD — `@id` only, the receiving consumer
 *  resolves the full Thing via the same @graph payload. */
export type EntityRef = { '@id': string };

/**
 * Full inline form for in-page graph resolution. Article-family pages
 * wrap the article + every referenced entity in a single `@graph` so the
 * `@id` refs in `about`/`mentions` resolve within the same JSON-LD
 * payload (Ahrefs flags otherwise-dangling refs as a schema.org notice).
 */
export type EntityNode = EntityData;

/**
 * Resolve a single slug to an entity reference. Returns `undefined` if the
 * slug is missing from the dictionary so callers can drop it rather than
 * emit broken JSON-LD.
 */
export function resolveEntity(slug: unknown): EntityRef | undefined {
  if (typeof slug !== 'string') return undefined;
  const entry = ENTITIES[slug];
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `[structured-data] Unknown entity slug "${slug}" — add to src/data/entities.json or fix the frontmatter reference.`,
      );
    }
    return undefined;
  }
  return { '@id': entry['@id'] };
}

/** Resolve an array of slugs to entity references, dropping unknowns. */
export function resolveEntities(slugs: unknown): EntityRef[] {
  if (!Array.isArray(slugs)) return [];
  const out: EntityRef[] = [];
  for (const slug of slugs) {
    const ref = resolveEntity(slug);
    if (ref) out.push(ref);
  }
  return out;
}

/**
 * Build the `about` + `mentions` properties of an Article-family schema
 * object from a frontmatter record. Returns a partial object that the
 * caller spreads into its JSON-LD payload — entries are only included
 * when at least one valid entity reference resolves.
 */
export function buildEntityRefs(
  frontMatter: Record<string, unknown>,
): { about?: EntityRef; mentions?: EntityRef[] } {
  const out: { about?: EntityRef; mentions?: EntityRef[] } = {};
  const about = resolveEntity(frontMatter.about);
  if (about) out.about = about;
  const mentions = resolveEntities(frontMatter.mentions);
  if (mentions.length > 0) out.mentions = mentions;
  return out;
}

/**
 * Build the full inline entity nodes that the article's `about`/`mentions`
 * `@id` refs point at. The caller wraps article + nodes in a single
 * `@graph` so all `@id` references resolve within the same JSON-LD
 * payload (avoids Ahrefs / schema.org-validator dangling-reference flags).
 *
 * De-dupes against the about entity so a slug that appears in both about
 * and mentions emits only one node.
 */
export function buildEntityNodes(
  frontMatter: Record<string, unknown>,
): EntityNode[] {
  const seen = new Set<string>();
  const out: EntityNode[] = [];
  const push = (slug: unknown) => {
    if (typeof slug !== 'string') return;
    if (seen.has(slug)) return;
    const entry = ENTITIES[slug];
    if (!entry) return;
    seen.add(slug);
    out.push(entry);
  };
  push(frontMatter.about);
  if (Array.isArray(frontMatter.mentions)) {
    for (const m of frontMatter.mentions) push(m);
  }
  return out;
}

/** Expose the raw dictionary for the M6 glossary `sameAs` cross-link. */
export function getEntityBySlug(slug: string): EntityData | undefined {
  return ENTITIES[slug];
}

/** Expose all entities for iteration (used by Glossary cross-link / M10 lint). */
export function allEntities(): Array<EntityData & { slug: string }> {
  return Object.entries(ENTITIES).map(([slug, e]) => ({ ...e, slug }));
}
