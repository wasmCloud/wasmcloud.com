import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { BlogPostMetadata } from '@docusaurus/plugin-content-blog';
import speakersData from '@site/src/data/speakers.json';
import { isTranscriptPermalink } from './utils';

type Chapter = { seconds: number; label: string };

type SpeakerPerson = {
  slug: string;
  name: string;
  org?: string;
  role?: string;
  wasmcloud_role?: 'maintainer' | 'contributor' | 'community' | 'emeritus';
  aliases?: string[];
};

type SpeakerOrg = { url: string };

type SpeakersJson = {
  speakers: SpeakerPerson[];
  organizations: Record<string, SpeakerOrg>;
};

const SPEAKERS = speakersData as SpeakersJson;

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

function secondsToIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let out = 'PT';
  if (h > 0) out += `${h}H`;
  if (m > 0) out += `${m}M`;
  if (s > 0 || (h === 0 && m === 0)) out += `${s}S`;
  return out;
}

function buildActors(frontMatter: Record<string, unknown>) {
  const raw = frontMatter.speakers;
  if (!Array.isArray(raw)) return undefined;
  const slugs = raw.filter((s): s is string => typeof s === 'string');
  if (slugs.length === 0) return undefined;

  const actors = slugs
    .map((slug) => {
      const person = SPEAKERS.speakers.find((p) => p.slug === slug);
      if (!person) return null;
      const actor: {
        '@type': 'Person';
        name: string;
        jobTitle?: string;
        affiliation?: { '@type': 'Organization'; name: string; url?: string };
      } = {
        '@type': 'Person',
        name: person.name,
      };
      if (person.role) actor.jobTitle = person.role;
      if (person.org) {
        const orgInfo = SPEAKERS.organizations[person.org];
        actor.affiliation = {
          '@type': 'Organization',
          name: person.org,
          ...(orgInfo?.url && { url: orgInfo.url }),
        };
      }
      return actor;
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return actors.length > 0 ? actors : undefined;
}

function getKeywords(frontMatter: Record<string, unknown>): string | undefined {
  const raw = frontMatter.keywords;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw)) {
    const cleaned = raw
      .filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
      .map((k) => k.trim());
    return cleaned.length > 0 ? cleaned.join(', ') : undefined;
  }
  return undefined;
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

  const keywords = getKeywords(frontMatter);
  const actor = buildActors(frontMatter);

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
        ...(durationSeconds !== undefined && {
          duration: secondsToIsoDuration(durationSeconds),
        }),
        ...(keywords && { keywords }),
        ...(actor && { actor }),
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
        // Enables Google Search "Key Moments" deep-link buttons: Google
        // substitutes the user's seek point into {seek_to_second_number}.
        potentialAction: {
          '@type': 'SeekToAction',
          target: `${watchUrl}&t={seek_to_second_number}`,
          'startOffset-input': 'required name=seek_to_second_number',
        },
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
