import React from 'react';
import faqData from '@site/src/data/faq.json';
import JsonLd from '@theme/wasmcloud/json-ld';

/**
 * M5 — FAQ page renderer + FAQPage JSON-LD emitter.
 *
 * The FAQ content is data-driven from `src/data/faq.json` so the visible
 * content and the JSON-LD schema stay in lockstep. Edit the JSON; this
 * component renders both surfaces from one source.
 *
 * Note on the FAQ rich result: Google's SERP FAQ rich result was fully
 * deprecated in May 2026. The schema is still parsed by AI Overviews,
 * Perplexity, Gemini, and ChatGPT for Q&A-shaped content ingestion, so
 * this remains a worthwhile emission — but do not promise a SERP FAQ
 * carousel from this. See M5 of the structured-data spike.
 */

type FaqQuestion = {
  id: string;
  question: string;
  answer: string;
};

type FaqSection = {
  id: string;
  title: string;
  intro?: string;
  questions: FaqQuestion[];
};

type FaqData = {
  sections: FaqSection[];
};

const DATA = faqData as unknown as FaqData;

function slugAnchor(slug: string): string {
  return `#${slug}`;
}

export default function FaqPage(): JSX.Element {
  const allQuestions: FaqQuestion[] = DATA.sections.flatMap((s) => s.questions);

  // Build the FAQPage JSON-LD payload from the same data the body renders.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions.map((q) => ({
      '@type': 'Question',
      '@id': `https://wasmcloud.com/docs/faq${slugAnchor(q.id)}`,
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

  return (
    <>
      <JsonLd data={faqSchema} />
      {DATA.sections.map((section) => (
        <section key={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          {section.intro ? <p>{section.intro}</p> : null}
          {section.questions.map((q) => (
            <article key={q.id}>
              <h3 id={q.id}>{q.question}</h3>
              {q.answer.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </article>
          ))}
        </section>
      ))}
    </>
  );
}
