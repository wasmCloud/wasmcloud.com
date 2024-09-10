import React from 'react';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { PageMetadata, HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogListPage';
import BlogPostItems from '@theme/BlogPostItems';
import BlogSidebar from '@theme/BlogSidebar';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import styles from './styles.module.css';
import BlogPostListItem from '../list-item';
import Layout from '@theme/Layout';
import useIsLive from '@site/src/pages/_hooks/use-is-live';
import { Links } from '@site/src/constants';

import SvgZoom from '@site/static/pages/home/icon/zoom.svg';
import SvgYoutube from '@site/static/pages/home/icon/youtube.svg';
import SvgCalendar from '@site/static/pages/home/icon/calendar.svg';

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
  const { countdown, showLinks } = useIsLive();
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
                      {metadata.blogDescription} Add the next meeting to your{' '}
                      <a href={Links.CALENDAR} target="_blank">
                        Calendar
                      </a>{' '}
                      or watch it live on{' '}
                      <a href={Links.YOUTUBE} target="_blank">
                        YouTube
                      </a>
                      .
                    </p>
                  </div>
                )}
                <aside className={styles.countdown}>
                  {showLinks ? (
                    <>
                      <span>Live now!</span>
                      <a href={Links.YOUTUBE} target="_blank">
                        <SvgYoutube />
                        Watch Live
                      </a>
                      <a href={Links.ZOOM} target="_blank">
                        <SvgZoom />
                        Join Meeting
                      </a>
                    </>
                  ) : (
                    <>
                      <span>Next meeting in {countdown}</span>
                      <a href={Links.CALENDAR} target="_blank">
                        <SvgCalendar />
                        Add to Calendar
                      </a>
                    </>
                  )}
                </aside>
              </header>
            )}

            <div className="row">
              <div className={styles.sidebar}>
                {/* // TODO(lachieh): Update to a custom sidebar with only dates once docusaurus@3.5.0 is released */}
                {/* https://github.com/facebook/docusaurus/pull/10252 */}
                <BlogSidebar sidebar={sidebar} />
              </div>
              <div className={clsx('col', sidebar.items.length > 0 ? 'col--9' : 'col--12')}>
                <div
                  className={clsx(styles.items, {
                    'first-page': isFirstPage,
                    'has-sidebar': sidebar.items.length > 0,
                  })}
                >
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
