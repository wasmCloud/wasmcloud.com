/**
 * community-speakers Docusaurus plugin
 *
 * Walks the community/ directory at build time, reads each meeting page's
 * `speakers:` frontmatter block, and exposes a date → slug-list map via
 * globalData. Lets transcript pages render the same `MeetingSpeakers`
 * component as their sibling meeting page without duplicating the speaker
 * list in two places.
 *
 * Only meeting pages (`<date>-community-meeting.mdx`) are read — transcripts
 * (`<date>-community-meeting-transcript.mdx`) are the consumers, not the
 * source. Files that don't carry a `speakers:` block are skipped silently.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import type {LoadContext, Plugin} from '@docusaurus/types';

export interface CommunitySpeakersData {
  /** Map keyed by `YYYY-MM-DD`. Value is the slug list from the meeting page. */
  speakersByDate: Record<string, string[]>;
}

const MEETING_RE = /^(\d{4}-\d{2}-\d{2})-community-meeting\.mdx$/;
const SPEAKERS_BLOCK_RE = /^speakers:\n((?:  - [^\n]+\n?)+)/m;

export default async function communitySpeakersPlugin(
  context: LoadContext,
): Promise<Plugin<CommunitySpeakersData>> {
  return {
    name: 'community-speakers-plugin',

    async loadContent() {
      const dir = path.join(context.siteDir, 'community');
      const files = await fs.readdir(dir);
      const speakersByDate: Record<string, string[]> = {};
      for (const file of files) {
        const m = file.match(MEETING_RE);
        if (!m) continue;
        const date = m[1];
        const text = await fs.readFile(path.join(dir, file), 'utf-8');
        const sm = text.match(SPEAKERS_BLOCK_RE);
        if (!sm) continue;
        const slugs = sm[1]
          .split('\n')
          .map((line) => line.replace(/^  - /, '').trim())
          .filter(Boolean);
        if (slugs.length > 0) speakersByDate[date] = slugs;
      }
      return {speakersByDate};
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },

    getPathsToWatch() {
      // Hot-reload trigger in dev when meeting frontmatter changes.
      return [path.join(context.siteDir, 'community/*-community-meeting.mdx')];
    },
  };
}
