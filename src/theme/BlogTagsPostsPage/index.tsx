import React from 'react';
import Head from '@docusaurus/Head';
import BlogTagsPostsPage from '@theme-original/BlogTagsPostsPage';
import type BlogTagsPostsPageType from '@theme/BlogTagsPostsPage';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof BlogTagsPostsPageType>;

// /blog/tags/<tag>/ and /community/tags/<tag>/ — thin, near-duplicate listing
// pages, already dropped from the sitemap (docusaurus.config.ts). Keep `follow`
// so the posts they list stay reachable.
export default function BlogTagsPostsPageWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <BlogTagsPostsPage {...props} />
    </>
  );
}
