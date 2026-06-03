import React from 'react';
import glossaryData from '@site/src/data/glossary.json';
import JsonLd from '@theme/wasmcloud/json-ld';
import { getEntityBySlug } from '@theme/wasmcloud/structured-data/entities';

/**
 * M6 — Glossary page renderer + DefinedTermSet JSON-LD emitter.
 *
 * Single-source of truth: `src/data/glossary.json` carries each term, its
 * definition, and an optional `entity_slug` that cross-links the
 * `DefinedTerm` to the M12 entity dictionary via `sameAs: { @id }`. AI
 * Overviews and Knowledge Graph cite DefinedTerm entries for
 * terminology-intent queries — high-value per dictionary entry.
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

export default function GlossaryPage(): JSX.Element {
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
    // Cross-link to the M12 entity dictionary when available — unifies the
    // term layer with the canonical entity graph.
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

  return (
    <>
      <JsonLd data={definedTermSet} />
      <dl>
        {DATA.terms.map((t) => (
          <React.Fragment key={t.id}>
            <dt id={t.id}>
              <h3 style={{ margin: '1.5rem 0 0.25rem 0' }}>{t.term}</h3>
            </dt>
            <dd style={{ margin: '0 0 1rem 0' }}>{t.definition}</dd>
          </React.Fragment>
        ))}
      </dl>
    </>
  );
}
