import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import faqData from '@site/src/data/faq.json';
import JsonLd from '@theme/wasmcloud/json-ld';

/**
 * M5 — FAQPage JSON-LD emitter. Companion to the visible Q&A content in
 * docs/faq.mdx; both surfaces are kept in sync by being driven from the
 * same `src/data/faq.json` source of truth.
 *
 * Google's SERP FAQ rich result was fully deprecated in May 2026. The
 * schema is still parsed by AI Overviews, Perplexity, Gemini, and
 * ChatGPT for Q&A-shaped content ingestion, so this remains worthwhile —
 * but do not promise a SERP FAQ carousel from this. See M5 of the spike.
 *
 * Mounting guard: emits ONLY on the canonical FAQ page (/docs/faq/). Risk
 * #6 in the spike — FAQPage schema on pages that aren't actually Q&A is a
 * manual-action risk. If this component is mistakenly imported into a
 * non-FAQ doc page, it silently returns null instead of emitting a
 * misleading schema. The path check matches with and without a trailing
 * slash, and tolerates a `/docs/{version}/faq/` versioned variant.
 */

const FAQ_PATH_RE = /\/docs\/(?:v?\d+(?:\.\d+)*\/)?faq\/?$/;

type FaqQuestion = {
  id: string;
  question: string;
  answer: string;
};

type FaqSection = {
  id: string;
  questions: FaqQuestion[];
};

type FaqData = {
  sections: FaqSection[];
};

const DATA = faqData as unknown as FaqData;

export default function FaqSchema(): JSX.Element | null {
  const { metadata } = useDoc();
  if (!FAQ_PATH_RE.test(metadata.permalink)) return null;

  const allQuestions: FaqQuestion[] = DATA.sections.flatMap((s) => s.questions);
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions.map((q) => ({
      '@type': 'Question',
      '@id': `https://wasmcloud.com/docs/faq#${q.id}`,
      name: q.question,
      text: q.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
        author: { '@id': 'https://wasmcloud.com/#organization' },
      },
    })),
  };
  return <JsonLd data={payload} />;
}
