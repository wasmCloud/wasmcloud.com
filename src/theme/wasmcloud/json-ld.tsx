import React from 'react';
import Head from '@docusaurus/Head';

/**
 * Canonical wrapper for `<script type="application/ld+json">` payloads.
 *
 * The component owns the `<Head>` wrapper because react-helmet-async
 * (Docusaurus's `<Head>` implementation) cannot resolve nested function
 * components inside `<Head>` during static-site generation. Children of
 * `<Head>` must be raw DOM elements (`<script>`, `<meta>`, `<link>`),
 * so JsonLd produces the entire `<Head>{...}</Head>` block itself —
 * callers just render `<JsonLd data={...} />` at any point in their tree.
 *
 * Dev-mode logs a `console.warn` if the payload is missing `@context` or
 * `@type` — these aren't strictly required for nested objects, but at the
 * top level they're load-bearing and easy to omit by accident.
 */
export type JsonLdData =
  | Record<string, unknown>
  | ReadonlyArray<Record<string, unknown>>;

interface Props {
  data: JsonLdData;
}

function validateRoot(payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') return;
  if (!('@context' in payload)) {
    // eslint-disable-next-line no-console
    console.warn('[structured-data] JsonLd payload is missing @context');
  }
  if (!('@type' in payload) && !('@graph' in payload)) {
    // eslint-disable-next-line no-console
    console.warn('[structured-data] JsonLd payload is missing @type / @graph');
  }
}

export default function JsonLd({ data }: Props): JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    if (Array.isArray(data)) {
      data.forEach((p) => validateRoot(p as Record<string, unknown>));
    } else {
      validateRoot(data as Record<string, unknown>);
    }
  }
  // Escape `<` so JSON-LD with embedded HTML-tag-shaped strings doesn't
  // break SSR parsing or break out of the script element.
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <Head>
      <script type="application/ld+json">{serialized}</script>
    </Head>
  );
}
