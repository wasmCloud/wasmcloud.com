import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import YouTube from 'react-player/youtube';
import { LangTab, LangTabs } from '@site/src/components/LangTabs';

// Markdown links to local files (e.g. `[full size](./images/x.webp)`) compile to
// hashed `/assets/...` URLs. Docusaurus's <Link> treats them as internal routes
// and, with `trailingSlash: true`, emits `/assets/files/x-<hash>.webp/`, which
// Netlify still serves, so crawlers index a duplicate URL. The `pathname://`
// prefix marks the link as non-route so it is emitted exactly as-is.
const ASSET_HREF_RE = /^\/assets\//;

export default {
  ...MDXComponents,
  LangTabs,
  LangTab,
  a: (props) => {
    const { href } = props;
    if (typeof href === 'string' && ASSET_HREF_RE.test(href)) {
      return <MDXComponents.a {...props} href={`pathname://${href}`} />;
    }
    return <MDXComponents.a {...props} />;
  },
  YouTube: (props) => {
    return (
      <YouTube controls {...props} height="auto" width="100%" style={{ aspectRatio: '16/9' }} />
    );
  },
};
