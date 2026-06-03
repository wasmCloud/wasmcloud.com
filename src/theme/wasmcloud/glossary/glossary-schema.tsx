import React from 'react';
import glossaryData from '@site/src/data/glossary.json';
import JsonLd from '@theme/wasmcloud/json-ld';
import { getEntityBySlug } from '@theme/wasmcloud/structured-data/entities';

/**
 * M6 — DefinedTermSet JSON-LD emitter. Companion to the visible glossary
 * content in docs/glossary.mdx; the JSON source of truth at
 * `src/data/glossary.json` lets the schema cross-reference the M12 entity
 * dictionary via `sameAs` without forcing the rendered content into a
 * component (which would break MDX heading-anchor detection).
 */

type Term = {
  id: string;
  term: string;
  definition: string;
  entity_slug?: string;
};

type GlossaryData = {
  terms: Term[];
};

const DATA = glossaryData as unknown as GlossaryData;
const GLOSSARY_SET_ID = 'https://wasmcloud.com/docs/glossary#defined-term-set';
const GLOSSARY_BASE = 'https://wasmcloud.com/docs/glossary';

export default function GlossarySchema(): JSX.Element {
  const termsSchema = DATA.terms.map((t) => {
    const url = `${GLOSSARY_BASE}#${t.id}`;
    const node: Record<string, unknown> = {
      '@type': 'DefinedTerm',
      '@id': url,
      name: t.term,
      description: t.definition,
      url,
      inDefinedTermSet: { '@id': GLOSSARY_SET_ID },
    };
    if (t.entity_slug) {
      const entity = getEntityBySlug(t.entity_slug);
      if (entity) {
        node.sameAs = entity['@id'];
      }
    }
    return node;
  });

  const definedTermSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': GLOSSARY_SET_ID,
    name: 'wasmCloud and WebAssembly Glossary',
    url: GLOSSARY_BASE,
    hasDefinedTerm: termsSchema,
  };

  return <JsonLd data={definedTermSet} />;
}
