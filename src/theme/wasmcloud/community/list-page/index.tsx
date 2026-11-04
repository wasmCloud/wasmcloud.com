import React from 'react';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { PageMetadata, HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogListPage';
import BlogPostItems from '@theme/BlogPostItems';
import CommunitySidebar from '../sidebar';
import Head from '@docusaurus/Head';
import { useBlogListPageStructuredData } from '@docusaurus/plugin-content-blog/client';
import { meetingStartIso } from '../meeting-time';
import { normalizeBlogListLd } from '../../structured-data/blog-list';
import styles from './styles.module.css';
import BlogPostListItem from '../list-item';
import Layout from '@theme/Layout';
import useIsLive from '@site/src/pages/_hooks/use-is-live';
import { Links } from '@site/src/constants';
import { isTranscriptPermalink } from '../utils';

import SvgZoom from '@site/static/pages/home/icon/zoom.svg';
import SvgYoutube from '@site/static/pages/home/icon/youtube.svg';
import SvgCalendar from '@site/static/pages/home/icon/calendar.svg';

/**
 * Docusaurus's default Blog list JSON-LD, corrected for community calls:
 * canonical trailing-slash URLs, each BlogPosting dated at the meeting's
 * real start (1:00 PM Eastern, not midnight UTC), and the wasmCloud
 * project credited instead of an empty `author: []`.
 */
function CommunityListStructuredData(props: Props): JSX.Element {
  const data = useBlogListPageStructuredData(props) as unknown as Record<string, unknown>;
  const fixed = normalizeBlogListLd(data, (post, i) =>
    meetingStartIso(
      post.datePublished,
      (props.items[i]?.content?.frontMatter as { start_time?: unknown } | undefined)?.start_time,
    ),
  );
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(fixed)}</script>
    </Head>
  );
}

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
  const { metadata, items: allItems, sidebar } = props;
  // Hide transcript posts from the main /community/ list; they remain
  // reachable from each summary page's "Read the full transcript →" link.
  const items = allItems.filter(
    (item) => !isTranscriptPermalink(item.content.metadata.permalink),
  );
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
                <CommunitySidebar sidebar={sidebar} />
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
      <CommunityListStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
