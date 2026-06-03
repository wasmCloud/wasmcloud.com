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

function labelFor(segment: string): string {
  const lower = segment.toLowerCase();
  if (LABEL_OVERRIDES[lower]) return LABEL_OVERRIDES[lower];
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
    const accumulatedPath = '/' + segments.slice(0, idx + 1).join('/') + '/';
    itemListElement.push({
      '@type': 'ListItem',
      position: idx + 2,
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
