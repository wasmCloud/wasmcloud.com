import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { BlogPostMetadata } from '@docusaurus/plugin-content-blog';
import { isTranscriptPermalink } from './utils';

type Chapter = { seconds: number; label: string };

/**
 * Constants shared across every community-meeting video page. Per-page values
 * (title, description, image, date, keywords, chapters) come from frontmatter.
 */
const VIDEO_LANGUAGE = 'en';
const VIDEO_PUBLISHER = {
  '@type': 'Organization' as const,
  name: 'wasmCloud',
  url: 'https://wasmcloud.com',
  logo: {
    '@type': 'ImageObject' as const,
    url: 'https://wasmcloud.com/logo/wasmcloud-social.png',
  },
};
const VIDEO_GENRE = 'Technology';
const VIDEO_CATEGORY = 'Community Calls';
// YouTube's maxresdefault thumbnails are 1280×720
const EMBED_WIDTH = '1280';
const EMBED_HEIGHT = '720';

const YOUTUBE_THUMBNAIL_RE = /^https?:\/\/i\.ytimg\.com\/vi\/([^/]+)\//;

function extractYouTubeId(image: unknown): string | null {
  if (typeof image !== 'string') return null;
  const m = image.match(YOUTUBE_THUMBNAIL_RE);
  return m ? m[1] : null;
}

function asIsoDate(date: unknown): string | undefined {
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return undefined;
}

function getChapters(frontMatter: Record<string, unknown>): Chapter[] {
  const raw = frontMatter.chapters;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (c): c is Chapter =>
        c != null &&
        typeof c === 'object' &&
        typeof (c as Chapter).seconds === 'number' &&
        typeof (c as Chapter).label === 'string',
    )
    .sort((a, b) => a.seconds - b.seconds);
}

/**
 * Emit Open Graph video tags and a VideoObject JSON-LD schema for community
 * meeting pages. The transcript pages share the canonical YouTube video with
 * their summary page, so they get OG video tags (for social previews) but no
 * VideoObject JSON-LD (avoids duplicate canonical-video schemas).
 */
export default function VideoSEO({
  metadata,
}: {
  metadata: BlogPostMetadata;
}): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const { frontMatter, date, title, description, permalink } = metadata;

  const youtubeId = extractYouTubeId(frontMatter.image);
  if (!youtubeId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
  const uploadDate = asIsoDate(date);
  const isTranscript = isTranscriptPermalink(permalink);
  const canonicalUrl = `${siteConfig.url}${permalink}`;

  const chapters = getChapters(frontMatter);
  // Total video length in seconds, from the landing page's `duration:`
  // frontmatter. Used to provide endOffset on the LAST hasPart Clip
  // (Google Search Console flags "Missing field endOffset" without it).
  const durationSeconds =
    typeof frontMatter.duration === 'number' ? frontMatter.duration : undefined;

  const videoObject = !isTranscript
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description,
        thumbnailUrl,
        uploadDate,
        contentUrl: watchUrl,
        embedUrl,
        url: canonicalUrl,
        inLanguage: VIDEO_LANGUAGE,
        genre: VIDEO_GENRE,
        isFamilyFriendly: true,
        publisher: VIDEO_PUBLISHER,
        ...(chapters.length > 0 && {
          hasPart: chapters.map((c, i) => {
            const next = chapters[i + 1];
            const endOffset = next ? next.seconds : durationSeconds;
            return {
              '@type': 'Clip',
              name: c.label,
              startOffset: c.seconds,
              ...(endOffset !== undefined && { endOffset }),
              url: `https://youtu.be/${youtubeId}?t=${c.seconds}`,
            };
          }),
        }),
      }
    : null;

  return (
    <Head>
      {/* OG video — gives FB/LinkedIn/Slack rich-card previews with playable video */}
      <meta property="og:type" content="video.other" />
      <meta property="og:video" content={watchUrl} />
      <meta property="og:video:url" content={watchUrl} />
      <meta property="og:video:secure_url" content={watchUrl} />
      <meta property="og:video:type" content="text/html" />
      <meta property="og:video:width" content={EMBED_WIDTH} />
      <meta property="og:video:height" content={EMBED_HEIGHT} />

      {/* Article freshness signals (also useful even though og:type is now video) */}
      {uploadDate && (
        <meta property="article:published_time" content={uploadDate} />
      )}
      <meta property="article:section" content={VIDEO_CATEGORY} />

      {/* VideoObject JSON-LD only on the canonical summary page */}
      {videoObject && (
        <script type="application/ld+json">
          {JSON.stringify(videoObject)}
        </script>
      )}
    </Head>
  );
}
