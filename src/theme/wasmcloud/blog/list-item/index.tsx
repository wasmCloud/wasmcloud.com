import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import clsx from 'clsx';
import type BlogPostItemType from '@theme/BlogPostItem';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof BlogPostItemType>;

function BlogPostListItem({ children, className }: Props): JSX.Element {
  const blogPost = useBlogPost();
  const { withBaseUrl } = useBaseUrlUtils();
  const image = blogPost.assets.image ?? blogPost.frontMatter.image;
  const pageImage = image ? withBaseUrl(image, { absolute: true }) : undefined;

  return (
    <div className={clsx(styles.postItem, className)}>
      {pageImage && <img className={styles.image} src={pageImage} alt={blogPost.metadata.title} />}
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
      </div>
    </div>
  );
}

export default BlogPostListItem;
