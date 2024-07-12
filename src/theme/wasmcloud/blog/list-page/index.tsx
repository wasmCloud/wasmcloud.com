import React from 'react';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { PageMetadata, HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogListPage';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import styles from './styles.module.css';
import BlogPostListItem from '../list-item';
import Layout from '@theme/Layout';

function BlogListPageMetadata(props: Props): JSX.Element {
  const { metadata } = props;
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink } = metadata;
  const isBlogOnlyMode = permalink === '/';
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props: Props): JSX.Element {
  const { metadata, items, sidebar } = props;
  const isFirstPage = metadata.page === 1;
  return (
    <Layout>
      <div className="container margin-bottom--xl">
        <div className="row">
          <main className="col">
            {metadata.blogTitle && (
              <header className={clsx(styles.header, 'row row--align-center')}>
                <div className="col col--8">
                  <h1 className={styles.title}>{metadata.blogTitle}</h1>
                </div>
                {metadata.blogDescription && (
                  <div className="col col--4">
                    <p className={styles.description}>
                      {metadata.blogDescription} Subscribe via{' '}
                      <a href="/blog/rss.xml" target="_blank">
                        RSS
                      </a>
                      ,{' '}
                      <a href="/blog/atom.xml" target="_blank">
                        Atom
                      </a>{' '}
                      or{' '}
                      <a href="https://twitter.com/wasmcloud" target="_blank" rel="noopener">
                        follow us on Twitter
                      </a>
                      .
                    </p>
                  </div>
                )}
              </header>
            )}
            <div className="row">
              <div className={clsx('col', 'col--12')}>
                <div className={clsx(styles.items, { 'first-page': isFirstPage })}>
                  <BlogPostItems items={items} component={BlogPostListItem} />
                </div>
              </div>
            </div>
            <div className={styles.paginator}>
              <BlogListPaginator metadata={metadata} />
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

export default function BlogListPage(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
