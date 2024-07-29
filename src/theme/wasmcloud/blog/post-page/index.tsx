import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import { BlogPostProvider, useBlogPost } from '@docusaurus/theme-common/internal';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogPostPageStructuredData from '@theme/BlogPostPage/StructuredData';
import Layout from '@theme/Layout';
import TOC from '@theme/TOC';
import type { Props } from '@theme/BlogPostPage';
import Unlisted from '@theme/Unlisted';
import styles from './styles.module.css';
import BlogPostItem from '../post-item';
import Link from '@docusaurus/Link';

function BlogPostPageContent({ children }: { children: ReactNode }): JSX.Element {
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
            <Link to="/blog" className={styles.backLink}>
              ← Back
            </Link>

            {unlisted && <Unlisted />}

            <BlogPostItem>
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
                <div className="col col--9">{children}</div>
              </div>
            </BlogPostItem>
          </main>
        </div>
      </div>
    </Layout>
  );
}

export default function BlogPostPage(props: Props): JSX.Element {
  const BlogPostContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogPostPage)}
      >
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <BlogPostPageContent>
          <BlogPostContent />
        </BlogPostPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
