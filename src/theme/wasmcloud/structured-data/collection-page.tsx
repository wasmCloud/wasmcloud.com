import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import JsonLd from '../json-ld';

/**
 * Per M9 — emit `CollectionPage` JSON-LD on list pages (`/blog/`, `/community/`).
 * `mainEntity` carries either a `Blog` reference (blog listings) or an
 * `ItemList` of recent items (community listings).
 */

interface CollectionPageProps {
  /** Canonical URL of the collection (e.g. /blog/, /community/) */
  permalink: string;
  /** Display name of the collection */
  name: string;
  /** Short description for the SERP snippet */
  description?: string;
  /**
   * Specialization: a Blog landing emits `mainEntity: Blog`; a directory of
   * meeting recordings emits `mainEntity: ItemList`. Callers pick one.
   */
  mainEntity?: Record<string, unknown>;
}

export default function CollectionPageSchema({
  permalink,
  name,
  description,
  mainEntity,
}: CollectionPageProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const url = `${siteUrl}${permalink}`;
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    inLanguage: 'en',
    isPartOf: { '@id': 'https://wasmcloud.com/#website' },
    publisher: { '@id': 'https://wasmcloud.com/#organization' },
  };
  if (description) payload.description = description;
  if (mainEntity) payload.mainEntity = mainEntity;
  return <JsonLd data={payload} />;
}
