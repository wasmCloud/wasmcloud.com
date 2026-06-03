import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { ThemeConfig } from '@docusaurus/preset-classic';
import JsonLd from '../json-ld';

/**
 * Emit a `SiteNavigationElement` JSON-LD listing the top-level navbar
 * entries. Cheap addition — helps Google understand site hierarchy and
 * surfaces the main IA in `sitelinks`. Per M1 of the structured-data spike.
 *
 * Only the navbar's top-level items are emitted. Dropdown children are
 * intentionally skipped — they change frequently and would bloat the
 * JSON-LD without much SERP benefit.
 */
export default function SiteNavigationSchema(): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as ThemeConfig;
  const navbarItems = themeConfig.navbar?.items ?? [];
  const baseUrl = siteConfig.url.replace(/\/$/, '');

  const elements: Array<Record<string, unknown>> = [];
  let position = 1;
  for (const item of navbarItems) {
    // Only items with a label + resolvable URL produce useful structured data
    const label = (item as { label?: string }).label;
    const href = (item as { href?: string }).href;
    const to = (item as { to?: string }).to;
    if (!label) continue;
    let url: string | undefined;
    if (typeof href === 'string') {
      url = href;
    } else if (typeof to === 'string') {
      url = `${baseUrl}${to.startsWith('/') ? to : '/' + to}`;
    }
    if (!url) continue;
    elements.push({
      '@type': 'SiteNavigationElement',
      position,
      name: label,
      url,
    });
    position += 1;
  }

  if (elements.length === 0) return null;

  // Wrap as a typed ItemList so the payload carries @context at the root
  // (cleaner than an unwrapped array even though both are accepted).
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'wasmCloud site navigation',
    itemListElement: elements,
  };
  return <JsonLd data={payload} />;
}
