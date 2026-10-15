import React from 'react';
import Head from '@docusaurus/Head';
import { useBreadcrumbsStructuredData } from '@docusaurus/plugin-content-docs/client';
import type { Props } from '@theme/DocBreadcrumbs/StructuredData';
import { withTrailingSlash } from '@theme/wasmcloud/structured-data/url';

/**
 * Swizzled (wrapped) Docusaurus docs BreadcrumbList. The upstream hook
 * builds each `item` from the doc permalink, which omits the trailing
 * slash the site's canonical URLs carry (`trailingSlash: true`) — so the
 * final crumb pointed at a 301. Normalize every item URL.
 */
export default function DocBreadcrumbsStructuredData(props: Props): JSX.Element {
  const data = useBreadcrumbsStructuredData({ breadcrumbs: props.breadcrumbs }) as unknown as {
    itemListElement?: Array<Record<string, unknown>>;
  };
  const fixed = {
    ...data,
    itemListElement: (data.itemListElement ?? []).map((el) =>
      typeof el.item === 'string' ? { ...el, item: withTrailingSlash(el.item) } : el,
    ),
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(fixed)}</script>
    </Head>
  );
}
