import React from 'react';
import Head from '@docusaurus/Head';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';
import type BlogTagsListPageType from '@theme/BlogTagsListPage';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof BlogTagsListPageType>;

// /blog/tags/ and /community/tags/ — tag index pages, already dropped from the
// sitemap (docusaurus.config.ts). Keep `follow` so the tag pages stay reachable.
export default function BlogTagsListPageWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <BlogTagsListPage {...props} />
    </>
  );
}
