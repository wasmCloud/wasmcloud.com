// Netlify's rule matching, reproduced. Pure functions, no Worker APIs, so
// `node --test worker/test/` can run them.
//
// The semantics that matter, each confirmed against production:
//   - First match wins, in file order.
//   - /x and /x/ are the same path to the matcher (/install/ redirects as
//     /install does). A splat rule /a/* also matches the bare /a, with an
//     empty splat.
//   - Repeated slashes collapse first: //install and /install// both match
//     /install.
//   - Matching is case-sensitive.
//   - A rule without `force` yields to a file at the requested path, and
//     matching carries on down the list: /docs is a page (301 to /docs/, its
//     pretty URL) although a rule sends /docs to /docs/overview/.
//   - A host-scoped rule only exists on its host: the docs.wasmcloud.com
//     catch-alls do nothing on wasmcloud.com.

/** Collapse repeated slashes. The result always starts with one slash. */
export function collapse(pathname) {
  return ('/' + pathname).replace(/\/{2,}/g, '/');
}

/** Drop trailing slashes, keeping the root as "/". */
export function norm(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

/**
 * Does `pathname` (already collapsed) match the rule or header pattern?
 * Returns null, or { splat } where splat is the text the /* captured.
 */
export function matchPattern(pattern, pathname) {
  // A header pattern with a * in the middle (/docs/*.md), as a regular
  // expression written by netlify2cf.py.
  if (pattern.glob) return globRegExp(pattern.glob).test(pathname) ? { splat: '' } : null;
  const from = norm(pattern.from);
  if (!pattern.splat) {
    return norm(pathname) === from ? { splat: '' } : null;
  }
  if (norm(pathname) === from) return { splat: '' };
  const prefix = from === '/' ? '/' : from + '/';
  if (pathname.startsWith(prefix)) return { splat: pathname.slice(prefix.length) };
  return null;
}

const globs = new Map();
function globRegExp(source) {
  let re = globs.get(source);
  if (!re) globs.set(source, (re = new RegExp(source)));
  return re;
}

/**
 * Every rule matching `pathname`, in file order, each with its target filled
 * in. A rule scoped to a hostname (`https://docs.wasmcloud.com/*`) exists only
 * for requests to that host. Lazy, because the caller usually takes the first
 * and only looks further when an unforced rule is shadowed by a file.
 */
export function* matches(rules, pathname, host) {
  const path = collapse(pathname);
  for (const rule of rules) {
    if (rule.host && rule.host !== host) continue;
    const m = matchPattern(rule, path);
    if (m) yield { rule, target: rule.to.replace(':splat', m.splat) };
  }
}

/** The first rule matching `pathname` on `host`, or null. */
export function matchRule(rules, pathname, host) {
  for (const hit of matches(rules, pathname, host)) return hit;
  return null;
}

/**
 * The rule Netlify applies: the first match, except that a rule without the
 * `!` force flag does not exist where a file does. `fileExists` is an async
 * thunk, called at most once and only if an unforced rule matches.
 */
export async function pickRule(rules, pathname, host, fileExists) {
  let exists;
  for (const hit of matches(rules, pathname, host)) {
    if (hit.rule.force) return hit;
    if (exists === undefined) exists = Boolean(await fileExists());
    if (!exists) return hit;
  }
  return null;
}

/** "a=b, c=d" from a Worker var, as a lower-cased Map. */
export function parseAliases(text) {
  const out = new Map();
  for (const pair of String(text || '').split(',')) {
    const [from, to] = pair.split('=').map((x) => (x || '').trim().toLowerCase());
    if (from && to) out.set(from, to);
  }
  return out;
}

/**
 * Every header from every matching block, later blocks overriding earlier
 * ones. Netlify applies all matching blocks, not just the first.
 */
export function headersFor(blocks, pathname) {
  const path = collapse(pathname);
  const out = new Map();
  for (const block of blocks) {
    if (!matchPattern(block, path)) continue;
    for (const [name, value] of block.headers) out.set(name.toLowerCase(), [name, value]);
  }
  return [...out.values()];
}

/** The first configured agent whose token appears in the User-Agent. */
export function matchAgent(config, userAgent) {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return null;
  if (config.never.some((n) => ua.includes(n.toLowerCase()))) return null;
  const hit = config.agents.find((a) => ua.includes(a.toLowerCase()));
  return hit || null;
}

/** True if the User-Agent is one that must always get the human HTML. */
export function isSearchCrawler(config, userAgent) {
  const ua = (userAgent || '').toLowerCase();
  return config.never.some((n) => ua.includes(n.toLowerCase()));
}

// --- Markdown at a URL of its own --------------------------------------------

/**
 * The pages a `.md` URL could stand for, most likely first, or none.
 *   /docs/faq/index.md -> /docs/faq/, /docs/faq/index.html
 *   /docs/faq.md       -> /docs/faq/, /docs/faq
 *   /index.md          -> /
 * Both spellings are in use by agents and checkers; neither is a standard.
 */
export function mdPageCandidates(pathname) {
  if (!pathname.endsWith('.md')) return [];
  const index = pathname.match(/^(.*\/)index\.md$/);
  if (index) return index[1] === '/' ? ['/'] : [index[1], index[1] + 'index.html'];
  const bare = pathname.slice(0, -'.md'.length);
  if (!bare || bare.endsWith('/')) return [];
  return [bare + '/', bare];
}

/**
 * The `.md` URL advertised for the page at `pathname`, as a path.
 *   /docs/faq/, /docs/faq, /docs/faq/index.html -> /docs/faq/index.md
 *   /                                            -> /index.md
 * Always one mdPageCandidates() leads back from.
 */
export function markdownAlternate(pathname) {
  let dir = pathname.replace(/\/index\.html$/, '/');
  if (!dir.endsWith('/')) dir += '/';
  return dir + 'index.md';
}

/**
 * An estimate of a Markdown document's size in tokens: UTF-8 bytes divided by
 * four, rounded up. Cloudflare's Markdown for Agents estimates tokens as
 * bytes / 4 rather than running a tokenizer, and this matches it.
 */
export function markdownTokens(text) {
  return Math.ceil(new TextEncoder().encode(text).length / 4);
}
