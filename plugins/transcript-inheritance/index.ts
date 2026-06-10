/**
 * transcript-inheritance Docusaurus plugin
 *
 * Wraps scripts/generate-transcript-inheritance.mjs into the Docusaurus
 * lifecycle so that during `docusaurus start`, the inheritance JSON
 * (src/data/transcript-inheritance.json) regenerates automatically
 * whenever a community/<date>-community-meeting.mdx file changes — no
 * manual `npm run generate:transcript-inheritance` between edits.
 *
 * The prebuild npm script still runs the same generator for production
 * builds; this plugin is purely the dev-mode watcher.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import type { LoadContext, Plugin } from '@docusaurus/types';

const MEETING_RE = /^(\d{4}-\d{2}-\d{2})-community-meeting\.mdx$/;

export default async function transcriptInheritancePlugin(
  context: LoadContext,
): Promise<Plugin<void>> {
  const generatorScript = path.join(
    context.siteDir,
    'scripts',
    'generate-transcript-inheritance.mjs',
  );

  async function runGenerator(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn('node', [generatorScript], {
        cwd: context.siteDir,
        stdio: 'inherit',
      });
      child.on('exit', (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`generate-transcript-inheritance exited ${code}`)),
      );
      child.on('error', reject);
    });
  }

  return {
    name: 'transcript-inheritance-plugin',

    async loadContent() {
      // Runs at startup AND every time a watched path (see below) changes.
      // Cheap to run — scans ~180 frontmatters and writes one JSON file.
      await runGenerator();
    },

    getPathsToWatch() {
      // Return the absolute file path of every landing MDX so that any
      // edit triggers Docusaurus to re-invoke loadContent() above. We
      // intentionally do NOT watch transcript files — they don't feed
      // the inheritance map (they consume it).
      return [path.join(context.siteDir, 'community', '*-community-meeting.mdx')];
    },
  };
}
