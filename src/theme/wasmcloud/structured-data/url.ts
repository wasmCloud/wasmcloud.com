/**
 * The site builds with `trailingSlash: true`, so every page's canonical URL
 * (the `<link rel="canonical">` Docusaurus emits) ends in `/`. Docusaurus
 * route metadata (`permalink`), however, omits the slash — and a JSON-LD
 * `url` / `@id` / `mainEntityOfPage` built from it points at a 301 rather
 * than the canonical page. Normalize every page URL we emit through this.
 *
 * Leaves file-like paths (`/foo.svg`), query strings, and fragments intact:
 * `https://x/a?b#c` → `https://x/a/?b#c`.
 */
export function withTrailingSlash(url: string): string {
  const m = url.match(/^([^?#]*)(.*)$/);
  if (!m) return url;
  const [, path, rest] = m;
  if (path.endsWith('/') || /\.[a-z0-9]+$/i.test(path.split('/').pop() ?? '')) return url;
  return `${path}/${rest}`;
}
