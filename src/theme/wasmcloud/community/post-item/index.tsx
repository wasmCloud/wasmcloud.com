import styles from './styles.module.css';
import clsx from 'clsx';
import type BlogPostItemType from '@theme/BlogPostItem';
import { useDateTimeFormat } from '@docusaurus/theme-common/internal';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import type { WrapperProps } from '@docusaurus/types';
import MDXContent from '@theme/MDXContent';

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
      <div className={styles.content}>
        <MDXContent>{children}</MDXContent>
      </div>
    </div>
  );
}

export default CommunityPostListItem;
