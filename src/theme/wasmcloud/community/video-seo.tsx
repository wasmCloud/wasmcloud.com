import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { BlogPostMetadata } from '@docusaurus/plugin-content-blog';
import speakersData from '@site/src/data/speakers.json';
import JsonLd from '@theme/wasmcloud/json-ld';
import { buildEntityRefs } from '@theme/wasmcloud/structured-data/entities';
import { isTranscriptPermalink } from './utils';

type Chapter = { seconds: number; label: string };

type SpeakerPerson = {
  slug: string;
  name: string;
  org?: string;
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
const PROJECT_ORG_ID = 'https://wasmcloud.com/#organization';
const VIDEO_PUBLISHER = { '@id': PROJECT_ORG_ID } as const;
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

type PersonEntity = {
  '@type': 'Person';
  name: string;
  affiliation?: { '@type': 'Organization'; name: string; url?: string };
};

/**
 * Resolve `speakers:` slugs into Person entities with optional Organization
 * affiliation. The `org` field on each speaker entry is SEO-only metadata —
 * never rendered visually on meeting / transcript pages — and is consumed
 * here to populate `actor.affiliation` for M11's VideoObject and M8's
 * transcript Article `mentions[]`.
 */
function buildSpeakers(frontMatter: Record<string, unknown>): PersonEntity[] | undefined {
  const raw = frontMatter.speakers;
  if (!Array.isArray(raw)) return undefined;
  const slugs = raw.filter((s): s is string => typeof s === 'string');
  if (slugs.length === 0) return undefined;

  const people = slugs
    .map((slug) => {
      const person = SPEAKERS.speakers.find((p) => p.slug === slug);
      if (!person) return null;
      const entity: PersonEntity = {
        '@type': 'Person',
        name: person.name,
      };
      if (person.org) {
        const orgInfo = SPEAKERS.organizations[person.org];
        entity.affiliation = {
          '@type': 'Organization',
          name: person.org,
          ...(orgInfo?.url && { url: orgInfo.url }),
        };
      }
      return entity;
    })
    .filter((a): a is PersonEntity => a !== null);

  return people.length > 0 ? people : undefined;
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
 * Derive the transcript URL from the meeting page's permalink. Mirror image
 * of the convention in `isTranscriptPermalink`: meeting page lives at
 * `/community/<date>-community-meeting/`, transcript at the same slug with
 * `-transcript` appended.
 */
function transcriptUrlForMeeting(siteUrl: string, permalink: string): string {
  const noTrailing = permalink.endsWith('/') ? permalink.slice(0, -1) : permalink;
  return `${siteUrl}${noTrailing}-transcript/`;
}

function meetingUrlForTranscript(siteUrl: string, permalink: string): string {
  const noTrailing = permalink.endsWith('/') ? permalink.slice(0, -1) : permalink;
  // strip -transcript suffix
  const meetingPath = noTrailing.replace(/-transcript$/, '');
  return `${siteUrl}${meetingPath}/`;
}

/**
 * Emit Open Graph video tags and JSON-LD schema for community meeting pages.
 *
 * Meeting page (M11 — VideoObject + Event):
 *   - VideoObject with hasPart/Clip chapters, SeekToAction, duration,
 *     keywords, actor[] Person+Org, contributor[], producer, transcript
 *     reciprocal link.
 *   - Event schema parallel to the VideoObject (parser ingestion / entity
 *     graph; virtual events no longer eligible for Google's Event rich
 *     result as of June 2025).
 *
 * Transcript page (M8 — Article):
 *   - Article with transcribes link back to the VideoObject's @id, plus
 *     mentions: [Person] for speakers and about/mentions Thing entities
 *     from M12's dictionary.
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
  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const canonicalUrl = `${siteUrl}${permalink}`;

  const chapters = getChapters(frontMatter);
  // Total video length in seconds, from the landing page's `duration:`
  // frontmatter. Used to provide endOffset on the LAST hasPart Clip
  // (Google Search Console flags "Missing field endOffset" without it).
  const durationSeconds =
    typeof frontMatter.duration === 'number' ? frontMatter.duration : undefined;

  const keywords = getKeywords(frontMatter);
  const speakers = buildSpeakers(frontMatter);
  const entityRefs = buildEntityRefs(frontMatter);

  // Stable IDs the schemas use to cross-reference each other:
  //   VideoObject @id  →  canonical meeting URL + #video
  //   Event @id        →  canonical meeting URL + #event
  //   Article @id      →  canonical transcript URL + #article
  // The Article→Video link uses `transcribes` (valid: range CreativeWork);
  // the reverse `transcript` field on VideoObject would expect a Text value
  // (the actual transcript content), so we only emit the Article→Video
  // direction. `recordedAt` ↔ `recordedIn` pairs the Video with its Event.
  const meetingPageUrl = isTranscript
    ? meetingUrlForTranscript(siteUrl, permalink)
    : canonicalUrl;
  const transcriptPageUrl = isTranscript
    ? canonicalUrl
    : transcriptUrlForMeeting(siteUrl, permalink);
  const videoObjectId = `${meetingPageUrl}#video`;
  const eventId = `${meetingPageUrl}#event`;
  const transcriptArticleId = `${transcriptPageUrl}#article`;

  // ---- Meeting page: VideoObject + Event -----------------------------------

  const videoObject = !isTranscript
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        '@id': videoObjectId,
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
        producer: VIDEO_PUBLISHER,
        learningResourceType: 'Recording',
        ...(durationSeconds !== undefined && {
          duration: secondsToIsoDuration(durationSeconds),
        }),
        ...(keywords && { keywords }),
        ...(speakers && { actor: speakers, contributor: speakers }),
        ...(entityRefs.about && { about: entityRefs.about }),
        ...(entityRefs.mentions && { mentions: entityRefs.mentions }),
        // No reciprocal `transcript:` field — schema.org's `transcript`
        // property on MediaObject expects a Text value (the actual
        // transcript content), not a URI reference to another page.
        // The Article side carries the canonical link via `transcribes`.
        // Pair the recording with its Event
        recordedAt: { '@id': eventId },
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

  // Event schema runs parallel to VideoObject on the meeting page. Note:
  // virtual events lost SERP rich-result eligibility in June 2025; this
  // emission is for parser ingestion + Person performer[] entity-graph
  // density (M11 Risk #13 in the spike).
  let eventEndDate: string | undefined;
  if (uploadDate && durationSeconds !== undefined) {
    try {
      const startMs = new Date(uploadDate).getTime();
      eventEndDate = new Date(startMs + durationSeconds * 1000).toISOString();
    } catch {
      eventEndDate = undefined;
    }
  }

  const event = !isTranscript && uploadDate
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        '@id': eventId,
        name: title,
        description,
        startDate: uploadDate,
        ...(eventEndDate && { endDate: eventEndDate }),
        // `EventCompleted` is NOT a schema.org EventStatusType value — the
        // enumeration is {Cancelled, MovedOnline, Postponed, Rescheduled,
        // Scheduled}. Past events that proceeded normally are `EventScheduled`
        // (the "nothing unusual happened to the schedule" default); the
        // past-dated `endDate` is what marks the event as having occurred.
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
          '@type': 'VirtualLocation',
          url: watchUrl,
        },
        organizer: VIDEO_PUBLISHER,
        ...(speakers && { performer: speakers }),
        inLanguage: VIDEO_LANGUAGE,
        isAccessibleForFree: true,
        url: canonicalUrl,
        recordedIn: { '@id': videoObjectId },
      }
    : null;

  // ---- Transcript page: Article --------------------------------------------

  const transcriptArticle = isTranscript
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': transcriptArticleId,
        headline: `${title} (Transcript)`,
        description,
        datePublished: uploadDate,
        // Author defaults to the wasmCloud project — transcripts are not
        // personally authored, the project entity is the appropriate author.
        author: VIDEO_PUBLISHER,
        publisher: VIDEO_PUBLISHER,
        inLanguage: VIDEO_LANGUAGE,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        // Link back to the canonical video entity. Google understands this
        // as "this text transcribes that video" and treats the meeting page
        // as the canonical AV asset.
        transcribes: { '@id': videoObjectId },
        // Series-level grouping (every weekly meeting is part of the
        // wasmCloud Community Meeting series)
        isPartOf: {
          '@type': 'Series',
          name: 'wasmCloud Community Meeting',
          url: `${siteUrl}/community/`,
        },
        // Speakers ⇒ mentions: [Person] with affiliation Organization edges
        ...(speakers && { mentions: speakers }),
        ...(entityRefs.about && { about: entityRefs.about }),
        // If both speakers AND topic-mentions exist, merge into a single
        // mentions array (Schema.org allows the same property to carry
        // mixed Person + Thing children).
        ...(entityRefs.mentions &&
          !speakers && { mentions: entityRefs.mentions }),
        ...(entityRefs.mentions &&
          speakers && {
            mentions: [...speakers, ...entityRefs.mentions],
          }),
      }
    : null;

  return (
    <>
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
      </Head>

      {/* JSON-LD: VideoObject + Event on meeting pages; Article on transcript pages.
       *  Each JsonLd owns its own <Head> wrapper — keeps JSON-LD payloads at
       *  the same React-tree depth as the OG meta tags above without nesting.
       */}
      {videoObject && <JsonLd data={videoObject} />}
      {event && <JsonLd data={event} />}
      {transcriptArticle && <JsonLd data={transcriptArticle} />}
    </>
  );
}
