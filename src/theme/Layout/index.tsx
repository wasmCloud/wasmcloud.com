import React from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { VideoModalProvider } from '@theme/wasmcloud/components/video-modal';
import BreadcrumbsSchema from '@theme/wasmcloud/structured-data/breadcrumbs';
import SiteNavigationSchema from '@theme/wasmcloud/structured-data/site-navigation';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  return (
    <>
      {/* Site-wide structured data (M1 — Foundations).
       *  - BreadcrumbsSchema emits a BreadcrumbList for every non-homepage
       *    route based on URL path; powers Google's breadcrumb-in-SERP.
       *  - SiteNavigationSchema emits SiteNavigationElement entries for the
       *    navbar's top-level items.
       *  Per-page schema (Article, VideoObject, FAQPage, etc.) is emitted
       *  by the page-type components that swizzle BlogPostPage, DocPage,
       *  community video-seo, etc. */}
      <BreadcrumbsSchema />
      <SiteNavigationSchema />
      <VideoModalProvider>
        <Layout {...props} />
      </VideoModalProvider>
    </>
  );
}
