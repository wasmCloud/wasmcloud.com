/**
 * Transcript posts are kept out of the main /community/ list and out of the
 * sidebar; they remain reachable from each summary page's "Read the full
 * transcript →" link and via direct URL.
 */
export function isTranscriptPermalink(permalink: string): boolean {
  return permalink.includes('transcript');
}
