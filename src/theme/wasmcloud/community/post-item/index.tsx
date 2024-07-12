import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import clsx from 'clsx';
import type BlogPostItemType from '@theme/BlogPostItem';
import { useBlogPost, useDateTimeFormat } from '@docusaurus/theme-common/internal';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof BlogPostItemType>;

function CommunityPostListItem({ children, className }: Props): JSX.Element {
  const blogPost = useBlogPost();

  const dateTimeFormat = useDateTimeFormat({
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const formatDate = (blogDate: string) => dateTimeFormat.format(new Date(blogDate));
  const title =
    'showTitle' in blogPost.frontMatter && blogPost.frontMatter.showTitle
      ? blogPost.metadata.title
      : formatDate(blogPost.metadata.date);

  return (
    <div className={clsx(styles.postItem, className)}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default CommunityPostListItem;
