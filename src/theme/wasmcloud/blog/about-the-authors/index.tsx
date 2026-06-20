import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { usePluginData } from '@docusaurus/useGlobalData';
import AuthorSocials from '@theme/Blog/Components/Author/Socials';
import styles from './styles.module.css';

type PeoplePagesData = {
  profileSlugs: string[];
  authorsKeyToSlug: Record<string, string>;
};

type Author = {
  key?: string;
  name?: string;
  title?: string;
  url?: string;
  imageURL?: string;
  socials?: Record<string, string>;
};

function AuthorCard({
  author,
  profileSlug,
}: {
  author: Author;
  profileSlug: string | undefined;
}): ReactNode {
  const profileUrl = profileSlug ? `/people/${profileSlug}/` : undefined;
  // Name link target: profile page → author URL (linkedin/github) →
  // unlinked. The visible "View profile →" CTA below is profile-only.
  const nameLinkTarget = profileUrl ?? author.url;

  return (
    <div className={styles.card}>
      {author.imageURL && (
        <Link
          to={nameLinkTarget}
          className={styles.avatarLink}
          aria-label={author.name ?? 'Author'}
        >
          <img
            className={styles.avatar}
            src={author.imageURL}
            alt={author.name ?? ''}
            loading="lazy"
          />
        </Link>
      )}
      <div className={styles.body}>
        {author.name && (
          <div className={styles.name}>
            {nameLinkTarget ? (
              <Link to={nameLinkTarget}>{author.name}</Link>
            ) : (
              author.name
            )}
          </div>
        )}
        {author.title && <div className={styles.title}>{author.title}</div>}
        {author.socials && Object.keys(author.socials).length > 0 && (
          <div className={styles.socials}>
            {/* AuthorSocials only reads `socials` off the author object;
             *  bridge the type since our local `Author` is a strict
             *  subset of the upstream Props['author']. */}
            <AuthorSocials author={author as unknown as Parameters<typeof AuthorSocials>[0]['author']} />
          </div>
        )}
        {profileUrl && (
          <Link to={profileUrl} className={styles.profileLink}>
            <span>View profile{author.name ? ` of ${author.name}` : ''}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * "About the author(s)" block rendered at the bottom of each blog post.
 *
 * Per the maintainer-authority audit (Liam, June 2026), the visible
 * E-E-A-T signal Google quality raters look for is a per-post author
 * surface that gathers photo, role, social links, and a pointer to a
 * canonical bio page. This component is the rendered counterpart to
 * the entity-graph @id unification in blog-post-schema.tsx#buildAuthors —
 * the JSON-LD ties the post to /people/<slug>/#person, and this card
 * is the on-page link the human reader (and a quality rater
 * cross-checking the schema) actually clicks.
 *
 * Skipped when the post has no authors. Authors without a /people/<slug>/
 * profile page (Caz, emeritus, external contributors) still get a card,
 * just without the "View profile →" CTA — the name links to their `url`
 * from authors.yml instead.
 *
 * Mounted from src/theme/wasmcloud/blog/post-item/index.tsx (the custom
 * BlogPostItem swizzle), after the MDX content. The default
 * BlogPostItem/Footer is not rendered on this site, so a Footer swizzle
 * would never fire — we mount the block inline instead.
 */
export default function AboutTheAuthors(): ReactNode {
  const { metadata, isBlogPostPage } = useBlogPost();
  const peoplePages = usePluginData('people-pages-plugin') as
    | PeoplePagesData
    | undefined;
  const authors = ((metadata as { authors?: Author[] }).authors ?? []).filter(
    (a): a is Author => a != null && typeof a === 'object',
  );

  if (!isBlogPostPage || authors.length === 0) return null;

  return (
    <section
      className={styles.aboutSection}
      aria-labelledby="about-the-authors-heading"
    >
      <h2 id="about-the-authors-heading" className={styles.heading}>
        About the {authors.length === 1 ? 'author' : 'authors'}
      </h2>
      <div
        className={`${styles.cards}${authors.length > 1 ? ` ${styles.multi}` : ''}`}
      >
        {authors.map((author, i) => (
          <AuthorCard
            key={author.key ?? author.name ?? i}
            author={author}
            profileSlug={
              author.key ? peoplePages?.authorsKeyToSlug[author.key] : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
