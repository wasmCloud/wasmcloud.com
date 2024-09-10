import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import clsx from 'clsx';
import type BlogPostItemType from '@theme/BlogPostItem';
import { useBlogPost } from '@docusaurus/theme-common/internal';
import type { WrapperProps } from '@docusaurus/types';
import MDXContent from '@theme/MDXContent';

type Props = WrapperProps<typeof BlogPostItemType>;

function CommunityPostItem({ children, className }: Props): JSX.Element {
  const blogPost = useBlogPost();

  return (
    <div className={clsx(styles.postItem, className)}>
      <div className={styles.text}>
        <h2 className={styles.title}>
          <Link to={blogPost.metadata.permalink}>{blogPost.metadata.title}</Link>
        </h2>
        <div className={styles.meta}>
          <BlogPostItemHeaderAuthors className={styles.authors} />
          <span className={styles.separator} />
          <span className={styles.info}>
            <BlogPostItemHeaderInfo />
          </span>
        </div>
        <div className={styles.content}>
          <MDXContent>{children}</MDXContent>
        </div>
      </div>
    </div>
  );
}

export default CommunityPostItem;
