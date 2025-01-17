import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import { BlogPostProvider, useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogPostPageStructuredData from '@theme/BlogPostPage/StructuredData';
import TOC from '@theme/TOC';
import type { Props } from '@theme/BlogPostPage';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import styles from './styles.module.css';
import Layout from '@theme/Layout';
import CommunityPostItem from '../post-item';
import Link from '@docusaurus/Link';

function CommunityPostPageContent({ children }: { children: ReactNode }): JSX.Element {
  const { metadata, toc } = useBlogPost();
  const { frontMatter, unlisted } = metadata;
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;
  return (
    <Layout>
      <div className={clsx('container', 'margin-vert--xl', styles.container)}>
        <div className="row">
          <main className="col">
            <Link to="/community" className={styles.backLink}>
              ← Back
            </Link>

            {unlisted && <Unlisted />}

            <CommunityPostItem>
              <div className="row">
                <div className="col col--3">
                  {!hideTableOfContents && toc.length > 0 ? (
                    <TOC
                      className={styles.toc}
                      toc={toc}
                      minHeadingLevel={tocMinHeadingLevel}
                      maxHeadingLevel={tocMaxHeadingLevel}
                    />
                  ) : undefined}
                </div>
                <div className="col col--7">{children}</div>
              </div>
            </CommunityPostItem>
          </main>
        </div>
      </div>
    </Layout>
  );
}

export default function CommunityPostPage(props: Props): JSX.Element {
  const CommunityPostContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogPostPage)}
      >
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <CommunityPostPageContent>
          <CommunityPostContent />
        </CommunityPostPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
