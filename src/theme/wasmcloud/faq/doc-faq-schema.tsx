import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import JsonLd from '@theme/wasmcloud/json-ld';
import { withTrailingSlash } from '@theme/wasmcloud/structured-data/url';

/**
 * FAQPage JSON-LD for a doc page whose Q&A is written by hand in MDX.
 *
 * `faq-schema.tsx` covers /docs/faq/, where the visible page and the schema
 * are both rendered from src/data/faq.json. The other FAQ pages
 * (/docs/wash/faq/, /docs/v1/reference/faq/) are prose, so each one keeps a
 * plain-text copy of its questions in src/data/ and passes it here:
 *
 *   import DocFaqSchema from '@theme/wasmcloud/faq/doc-faq-schema';
 *   import faq from '@site/src/data/faq-wash.json';
 *   <DocFaqSchema questions={faq.questions} />
 *
 * The copy must say what the page says: FAQPage markup for questions a
 * reader cannot find on the page is a structured-data policy violation.
 * Edit the MDX and the JSON together. `id` is the heading anchor of the
 * question on the page, when it has one.
 */

const ORG_REF = { '@id': 'https://wasmcloud.com/#organization' } as const;

export type DocFaqQuestion = {
  id?: string;
  question: string;
  answer: string;
};

interface Props {
  questions: ReadonlyArray<DocFaqQuestion>;
}

export default function DocFaqSchema({ questions }: Props): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const { metadata } = useDoc();
  if (!questions || questions.length === 0) return null;

  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const pageUrl = withTrailingSlash(`${siteUrl}${metadata.permalink}`);

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      ...(q.id && { '@id': `${pageUrl}#${q.id}` }),
      name: q.question,
      text: q.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
        author: ORG_REF,
      },
    })),
  };
  return <JsonLd data={payload} />;
}
