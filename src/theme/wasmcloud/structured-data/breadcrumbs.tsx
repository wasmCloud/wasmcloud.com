import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import JsonLd from '../json-ld';

/**
 * Emit a BreadcrumbList JSON-LD on every non-homepage route, derived from
 * the URL path. Per M1 of the structured-data spike — cheap, blast-radius-
 * site-wide, enables Google's breadcrumb-in-SERP appearance.
 *
 * The label for each segment is title-cased from the slug, with a small
 * dictionary of overrides so abbreviations and brand names render with
 * the correct capitalization (`Docs` not `Docs`, `FAQ` not `Faq`).
 */

const LABEL_OVERRIDES: Record<string, string> = {
  docs: 'Docs',
  blog: 'Blog',
  community: 'Community',
  faq: 'FAQ',
  api: 'API',
  cli: 'CLI',
  wash: 'wash',
  wadm: 'wadm',
  wasi: 'WASI',
  wasm: 'Wasm',
  wasmcloud: 'wasmCloud',
  jco: 'JCO',
  mcp: 'MCP',
  oci: 'OCI',
  aiops: 'AIOps',
  ai: 'AI',
  llm: 'LLM',
  cncf: 'CNCF',
  http: 'HTTP',
  https: 'HTTPS',
  grpc: 'gRPC',
  json: 'JSON',
  ts: 'TS',
  tls: 'TLS',
  nats: 'NATS',
  otel: 'OTel',
  k8s: 'K8s',
};

// Version-like segments (Docusaurus versioned-docs: /docs/v1/..., /docs/0.82/...).
const VERSION_SEGMENT_RE = /^v?\d+(\.\d+)*$/;

function labelFor(segment: string): string {
  const lower = segment.toLowerCase();
  if (LABEL_OVERRIDES[lower]) return LABEL_OVERRIDES[lower];
  // Preserve version-like segments verbatim — "v1" reads better than "V1",
  // and "0.82" shouldn't be touched.
  if (VERSION_SEGMENT_RE.test(segment)) return segment;
  // Title-case kebab/underscore-separated slugs
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => {
      const w = word.toLowerCase();
      if (LABEL_OVERRIDES[w]) return LABEL_OVERRIDES[w];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Return true if the segment at `idx` should be hidden from the breadcrumb
 * chain (but still contribute to URL accumulation for subsequent crumbs).
 * Skipped:
 *   - Versioned-docs version segments when NOT the last segment.
 *     `/docs/v1/concepts/` → Home → Docs → Concepts (version absorbed).
 *     `/docs/v1/` (the version landing page itself) → Home → Docs → v1.
 *   - Blog/community pagination markers (`page` + the numeric page index
 *     that follows). `/blog/page/2/` → Home → Blog (the `/blog/page/` URL
 *     isn't a real page and `/blog/page/2/` is best reached from `/blog/`).
 */
function shouldSkipSegment(segments: string[], idx: number): boolean {
  const seg = segments[idx];
  const isLast = idx === segments.length - 1;
  if (VERSION_SEGMENT_RE.test(seg) && !isLast) return true;
  if (seg === 'page') return true;
  const prev = idx > 0 ? segments[idx - 1] : null;
  if (prev === 'page' && /^\d+$/.test(seg)) return true;
  return false;
}

export default function BreadcrumbsSchema(): JSX.Element | null {
  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();

  // Skip homepage — no breadcrumb chain
  if (pathname === '/' || pathname === '') return null;

  // Split path into segments, dropping leading/trailing empties
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const baseUrl = siteConfig.url.replace(/\/$/, '');

  const itemListElement: Array<Record<string, unknown>> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${baseUrl}/`,
    },
  ];

  segments.forEach((segment, idx) => {
    if (shouldSkipSegment(segments, idx)) return;
    const accumulatedPath = '/' + segments.slice(0, idx + 1).join('/') + '/';
    itemListElement.push({
      '@type': 'ListItem',
      position: itemListElement.length + 1,
      name: labelFor(segment),
      item: `${baseUrl}${accumulatedPath}`,
    });
  });

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return <JsonLd data={data} />;
}
