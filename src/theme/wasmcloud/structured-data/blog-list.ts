import { withTrailingSlash } from './url';

const PROJECT_ORG_REF = { '@id': 'https://wasmcloud.com/#organization' };

/**
 * Post-process Docusaurus's default Blog-list JSON-LD
 * (`useBlogListPageStructuredData`): canonical trailing-slash URLs on the
 * Blog and every BlogPosting, and the wasmCloud project as author when a
 * post has no personal authors (upstream emits an empty `author: []`).
 * `datePublishedFor` lets the community list re-date each meeting.
 */
export function normalizeBlogListLd(
  data: Record<string, unknown>,
  datePublishedFor?: (post: Record<string, unknown>, index: number) => string | undefined,
): Record<string, unknown> {
  const fix = (v: unknown) => (typeof v === 'string' ? withTrailingSlash(v) : v);
  const posts = (data.blogPost as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...data,
    '@id': fix(data['@id']),
    mainEntityOfPage: fix(data.mainEntityOfPage),
    blogPost: posts.map((post, i) => {
      const date = datePublishedFor?.(post, i);
      const author = post.author;
      return {
        ...post,
        '@id': fix(post['@id']),
        url: fix(post.url),
        mainEntityOfPage: fix(post.mainEntityOfPage),
        ...(date && { datePublished: date }),
        author: Array.isArray(author) && author.length === 0 ? PROJECT_ORG_REF : author,
      };
    }),
  };
}
