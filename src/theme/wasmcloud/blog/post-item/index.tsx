import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import clsx from 'clsx';
import type BlogPostItemType from '@theme/BlogPostItem';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import type { WrapperProps } from '@docusaurus/types';
import MDXContent from '@theme/MDXContent';
import AboutTheAuthors from '../about-the-authors';

type Props = WrapperProps<typeof BlogPostItemType>;

function CommunityPostItem({ children, className }: Props): JSX.Element {
  const blogPost = useBlogPost();

  return (
    <div className={clsx(styles.postItem, className)}>
      <div className={styles.text}>
        <h1 className={styles.title}>
          <Link to={blogPost.metadata.permalink}>{blogPost.metadata.title}</Link>
        </h1>
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
        <AboutTheAuthors />
      </div>
    </div>
  );
}

export default CommunityPostItem;
