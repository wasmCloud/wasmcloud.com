// wasmcloud-www: wasmcloud.com on Cloudflare Workers.
//
// Netlify serves wasmcloud.com from one deploy: the Docusaurus build, the
// redirects and headers in netlify.toml, and static/_headers. This Worker
// holds the same three things. The build sits in its static assets, and the
// rules sit in routes.generated.json, which scripts/netlify2cf.py writes from
// the Netlify files. Nothing about routing is decided here that is not in
// that table or observed on production; see router.js for the matching
// semantics and netlify2cf.py for why this is not a Cloudflare _redirects
// file.
//
// Per request, in order:
//   1. Plain http -> https on the same host; www -> the bare domain. Netlify
//      does both before any rule runs, and neither is in a file.
//   2. Test host? (TEST_HOSTS, *.workers.dev) -> every response gets
//      X-Robots-Tag: noindex, nofollow.
//   3. AI agent?  (User-Agent in agents.json, or Accept: text/markdown) -> a
//      page that would answer 200 text/html answers as Markdown instead.
//   4. Redirect rules, then static assets with Netlify's pretty-URL
//      behaviour, then 404.html.
//
// The asset binding is configured with html_handling "none" and
// not_found_handling "none" (wrangler.jsonc), so it does exactly one thing:
// return the file at a path, or 404. Every pretty-URL decision is made here,
// where it can match Netlify's.

import agentConfig from '../agents.json';
import generated from '../routes.generated.json';
import {
  collapse, headersFor, isSearchCrawler, markdownAlternate, markdownTokens, matchAgent, mdPageCandidates,
  parseAliases, pickRule,
} from './router.js';

const RULES = generated.rules;
const HEADERS = generated.headers;
const PRIMARY = generated.primary;
// Hostnames a rule may be scoped to. Any other host (the test hostname, a
// preview URL) is answered as the primary.
const HOSTS = new Set(generated.hosts);
// Asset paths of the HTML pages that have a build-time Markdown twin
// (/docs/faq/index.html). Written by netlify2cf.py after html2md.py has run,
// so "does this page have a Markdown version" is answered from memory.
const TWINS = new Set(generated.twins || []);
// Every file in the assets, and the same list keyed by lower-cased path.
// "Is there a file here" is answered from these, so a request makes one call
// to the asset binding (the file itself) and a redirect makes none.
const FILES = new Set(generated.files || []);
const FILES_BY_LOWER = new Map((generated.files || []).map((f) => [f.toLowerCase(), f]));

// Markdown responses name the page's real home, whichever host served them.
const CANONICAL_ORIGIN = `https://${PRIMARY}`;
// Netlify's default for everything it serves.
const DEFAULT_CACHE_CONTROL = 'public,max-age=0,must-revalidate';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Netlify does these two before any rule runs, so the Worker does too.
    // Plain http goes to https on the same host (never in local development,
    // which is http only), then www goes to the bare domain.
    const local = env.DEV_HOST_HEADER || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
    if (url.protocol === 'http:' && !local) {
      return hostRedirect(`https://${url.host}${url.pathname}${url.search}`);
    }
    // The production hostname this request stands for.
    let host = url.hostname.toLowerCase();
    // Local development only: `wrangler dev` pins the hostname to the first
    // route, so `make cf-dev` lets a header choose the host under test.
    if (env.DEV_HOST_HEADER && request.headers.get('x-test-host')) {
      host = request.headers.get('x-test-host').toLowerCase();
    }
    // A test alias (docs-next.wasmcloud.com) is answered as its real host.
    host = parseAliases(env.HOST_ALIASES).get(host) || host;
    if (host === `www.${PRIMARY}`) {
      return hostRedirect(`https://${PRIMARY}${url.pathname}${url.search}`);
    }
    if (!HOSTS.has(host)) host = PRIMARY;

    const ua = request.headers.get('user-agent') || '';
    const readOnly = request.method === 'GET' || request.method === 'HEAD';
    const agent = matchAgent(agentConfig, ua);
    const acceptsMd = /\btext\/markdown\b/i.test(request.headers.get('accept') || '');

    const context = (path, raw, wantsMd) => ({
      request, env, ctx, url, readOnly, host, path,
      // The path exactly as asked, before repeated slashes were collapsed.
      // Netlify redirects an HTML page reached by any spelling but its own.
      raw,
      wantsMd,
    });
    // Never for a search crawler, whatever it asks for: see agents.json.
    let c = context(collapse(url.pathname), url.pathname,
      readOnly && !isSearchCrawler(agentConfig, ua) && Boolean(agent || acceptsMd));
    let mdUrl = false;

    let res;
    try {
      res = await route(c);
      // /docs/faq.md, /docs/faq/index.md: the Markdown of /docs/faq/ at a URL
      // of its own, for clients that cannot send an Accept header. Only where
      // nothing else answers: a real file (the .md files docusaurus-plugin-llms
      // writes) or a rule has already won by this point.
      if (res.status === 404 && readOnly) {
        for (const candidate of mdPageCandidates(c.path)) {
          const c2 = context(candidate, candidate, true);
          const page = await route(c2);
          if (page.status === 200 && isMarkdown(page)) {
            res = page;
            c = c2;
            mdUrl = true;
            break;
          }
        }
      }
    } catch (err) {
      console.error('wasmcloud-www:', err && err.stack ? err.stack : err);
      res = new Response('Internal error', { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    // An asset response has immutable headers; re-wrap to edit them.
    res = new Response(res.body, res);
    const markdown = isMarkdown(res);
    for (const [name, value] of headersFor(HEADERS, c.path)) {
      // netlify.toml relabels the docs' .md files as text/plain. Here Markdown
      // is always served as text/markdown: it is what an agent asking for a
      // .md URL checks for. See "Known differences" in CLOUDFLARE-MIGRATION.md.
      if (markdown && name.toLowerCase() === 'content-type') continue;
      res.headers.set(name, value);
    }
    if (isTestHost(url.hostname, env)) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    // A .md URL answered from a twin is a second public address for a page.
    // Its canonical Link names the HTML page, and noindex keeps the copy out
    // of search results. The same Markdown negotiated at the page's own URL
    // is not marked: that URL is the one that should be indexed.
    else if (mdUrl) res.headers.set('X-Robots-Tag', 'noindex');

    if (c.wantsMd) {
      logAgentHit(env, c.path, agent || (mdUrl ? 'md-url' : 'accept-markdown'), markdown, url.hostname);
    }
    return res;
  },
};

function isMarkdown(res) {
  return (res.headers.get('content-type') || '').toLowerCase().startsWith('text/markdown');
}

// --- routing ----------------------------------------------------------------

async function route(c) {
  // /_md/ holds the build-time Markdown twins. An implementation detail:
  // reachable through the agent branch, never by asking for it.
  if (/^\/_md(\/|$)/.test(c.path)) return notFound(c);

  const hit = await pickRule(RULES, c.path, c.host, async () => findAsset(c, c.path));
  if (hit) return redirect(c, hit.target, hit.rule.status);
  return serveLocal(c);
}

// The scheme and www redirects, as Netlify answers them.
function hostRedirect(location) {
  return new Response(`Redirecting to ${location}`, {
    status: 301,
    headers: { location, 'content-type': 'text/plain; charset=utf-8' },
  });
}

/**
 * A rule's redirect the way Netlify writes one. The Location is the target as
 * the rule wrote it, so a path stays a path (`/docs/installation/`), with the
 * visitor's query string added unless the target has its own, ahead of any
 * fragment: /docs/cli/app?x=1 -> /docs/v1/cli/wash/?x=1#wash-app.
 */
function redirect(c, target, status) {
  const to = new URL(target, c.url);
  const external = /^https:\/\//.test(target);
  let location;
  if (external && /^https:\/\/[^/?#]+$/.test(target) && c.url.search) {
    // A bare origin keeps its spelling when a query is added:
    // /slack?a=1 -> https://slack.wasmcloud.com?a=1 (and /slack ->
    // https://slack.wasmcloud.com/). Both observed on production.
    location = target + c.url.search;
  } else {
    if (!to.search) to.search = c.url.search;
    location = external ? to.href : to.pathname + to.search + to.hash;
  }
  return new Response(`Redirecting to ${target}`, {
    status,
    headers: {
      location,
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': DEFAULT_CACHE_CONTROL,
    },
  });
}

// --- static assets ----------------------------------------------------------

function asset(c, path, init) {
  return c.env.ASSETS.fetch(new Request(new URL(path, c.url), init));
}

/**
 * The file Netlify would serve for `path`, as an asset path, or null.
 * Netlify resolves /x to x, x.html or x/index.html, and tolerates a trailing
 * slash on a file (/robots.txt/ serves robots.txt). A directory with no
 * index.html is a 404 (/img/, /assets). `has` is the lookup to use.
 */
function resolveAsset(path, has) {
  const candidates = path.endsWith('/')
    ? [path + 'index.html', path.slice(0, -1), path.slice(0, -1) + '.html']
    : [path, path + '.html', path + '/index.html'];
  for (const candidate of candidates) {
    if (candidate && candidate !== '/') {
      const found = has(candidate);
      if (found) return found;
    }
  }
  return null;
}

/**
 * resolveAsset, exactly and then without regard to case: Netlify finds files
 * case-insensitively (/LLMS.txt, /Docs/Overview/). This is also "does a file
 * exist here" for the purpose of an unforced rule.
 */
function findAsset(c, path) {
  return resolveAsset(path, (p) => (FILES.has(p) ? p : null))
    || resolveAsset(path.toLowerCase(), (p) => FILES_BY_LOWER.get(p) || null);
}

/** The URL Netlify treats as an HTML file's own: /a/index.html -> /a/, /a.html -> /a. */
function prettyUrl(assetPath) {
  if (assetPath.endsWith('/index.html')) return assetPath.slice(0, -'index.html'.length);
  return assetPath.slice(0, -'.html'.length);
}

/**
 * Serve the visitor's path from static assets, with Netlify's pretty URLs
 * (build.processing.html.pretty_urls = true in netlify.toml).
 *
 * An HTML page answers 200 at two spellings only: its pretty URL (/docs/faq/,
 * /404) and its file name (/docs/faq/index.html, /404.html). Every other
 * spelling that finds it is a 301 to the pretty URL: no trailing slash
 * (/docs/faq), /docs/faq/index, the wrong case (/Docs/FAQ/), repeated slashes
 * (//docs//faq/), a slash too many (/404/). Any other kind of file is served
 * at whatever spelling found it (/Robots.TXT, /robots.txt/, //robots.txt).
 * All observed on production.
 */
async function serveLocal(c) {
  if (!c.readOnly) {
    // What Netlify answers to a POST at a static path (its form handler).
    return new Response('Bad request, missing form', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'private,max-age=0' },
    });
  }

  // The real fetch carries the visitor's headers, so conditional requests get
  // their 304 from the asset layer.
  const fetchAsset = (at) => asset(c, at, { method: c.request.method, headers: c.request.headers });

  const assetPath = findAsset(c, c.path);
  if (!assetPath) return notFound(c);
  if (assetPath.endsWith('.html')) {
    const pretty = prettyUrl(assetPath);
    if (c.raw !== assetPath && c.raw !== pretty) return prettyRedirect(c, pretty);
    if (c.wantsMd) {
      const md = await markdownTwin(c, assetPath);
      if (md) return md;
    }
  }
  let res = await fetchAsset(assetPath);
  // The list and the assets are built together, so this only happens if they
  // were deployed apart.
  if (res.status === 404) return notFound(c);
  // The asset layer answers a Range request itself, and leaves the caching
  // header off the 206 that it puts on the 200.
  if (!res.headers.get('cache-control') && (res.status === 200 || res.status === 206)) {
    res = new Response(res.body, res);
    res.headers.set('cache-control', DEFAULT_CACHE_CONTROL);
  }

  // A file type the asset layer has no name for (.excalidraw) is sent with no
  // Content-Type; Netlify says application/octet-stream.
  if ((res.status === 200 || res.status === 206) && !res.headers.get('content-type')) {
    res = new Response(res.body, res);
    res.headers.set('content-type', 'application/octet-stream');
  }
  // Cloudflare's edge serves text assets as bare `text/html`; Netlify, and so
  // production, declares the charset. (`wrangler dev` adds one itself, so
  // this only shows on the real edge.)
  const type = res.headers.get('content-type') || '';
  if (/^text\/[a-z+-]+\s*$/i.test(type)) {
    res = new Response(res.body, res);
    res.headers.set('content-type', `${type.trim()}; charset=UTF-8`);
  }
  if (assetPath.endsWith('.html')) {
    const out = withVary(res);
    // Tell a client holding the HTML where the Markdown is (RFC 8288). The
    // page's <head> carries the same pointer as a <link> tag, added by
    // scripts/html2md.py.
    if (TWINS.has(assetPath)) {
      out.headers.append('Link',
        `<${c.url.origin}${markdownAlternate(prettyUrl(assetPath))}>; rel="alternate"; type="text/markdown"`);
    }
    return out;
  }
  if (res.status === 200 && c.request.method === 'GET' && c.request.headers.has('range')) {
    return byteRange(res, c.request.headers.get('range'));
  }
  // Cloudflare labels scripts text/javascript; Netlify, and so production,
  // says application/javascript. Same meaning, but parity is by header value.
  if (/\.m?js$/.test(assetPath) && res.headers.has('content-type')) {
    const out = new Response(res.body, res);
    out.headers.set('content-type', 'application/javascript; charset=UTF-8');
    return out;
  }
  return res;
}

/**
 * Answer a single-range request from a full asset response. Netlify serves
 * 206, and Safari will not play media from an origin that ignores Range; this
 * covers the asset layer answering 200 regardless. Anything but one
 * satisfiable `bytes=` range gets the full response back, which the spec
 * allows.
 */
async function byteRange(res, range) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === '' && m[2] === '')) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  let start;
  let end;
  if (m[1] === '') {
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  const headers = new Headers(res.headers);
  headers.set('accept-ranges', 'bytes');
  if (start >= size || start > end) {
    headers.set('content-range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set('content-range', `bytes ${start}-${end}/${size}`);
  headers.set('content-length', String(end - start + 1));
  return new Response(buf.slice(start, end + 1), { status: 206, headers });
}

/** Netlify's own redirect to a page's pretty URL: a path, query kept. */
function prettyRedirect(c, target) {
  return new Response(
    '<HTML><HEAD><TITLE>Document moved</TITLE></HEAD><BODY>Document moved permanently</a></BODY></HTML>',
    { status: 301, headers: { location: target + c.url.search, 'content-type': 'text/html' } });
}

async function notFound(c) {
  const page = await asset(c, '/404.html', { method: c.readOnly ? c.request.method : 'GET' });
  return new Response(page.status === 200 ? page.body : 'Not found', {
    status: 404,
    headers: {
      'content-type': page.status === 200 ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
      'cache-control': DEFAULT_CACHE_CONTROL,
    },
  });
}

/** An HTML page has a Markdown variant, so caches must key on what chose it. */
function withVary(res) {
  const out = new Response(res.body, res);
  out.headers.append('Vary', 'Accept');
  out.headers.append('Vary', 'User-Agent');
  return out;
}

// --- the AI-agent layer -----------------------------------------------------

function markdownResponse(c, body, canonical) {
  return new Response(c.request.method === 'HEAD' ? null : body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      vary: 'Accept, User-Agent',
      link: `<${canonical}>; rel="canonical"`,
      'cache-control': DEFAULT_CACHE_CONTROL,
      // The header Cloudflare's own Markdown for Agents sends: an estimate of
      // the document's size in tokens, for a client budgeting its context.
      'x-markdown-tokens': String(markdownTokens(body)),
      // What the content may be used for (contentsignals.org). The policy
      // itself lives in agents.json.
      ...(agentConfig.contentSignal ? { 'content-signal': agentConfig.contentSignal } : {}),
    },
  });
}

/** The canonical URL for a path, on the production origin. */
function canonicalFor(href, fallbackPath) {
  try {
    const u = new URL(href, CANONICAL_ORIGIN);
    return CANONICAL_ORIGIN + u.pathname;
  } catch {
    return CANONICAL_ORIGIN + fallbackPath;
  }
}

/**
 * scripts/html2md.py writes /_md/<asset path>.md beside the build, with the
 * canonical URL in its front matter. No twin, no Markdown: the caller falls
 * through to the HTML.
 */
async function markdownTwin(c, assetPath) {
  if (!TWINS.has(assetPath)) return null;
  const mdPath = '/_md' + assetPath.replace(/\.html$/, '.md');
  const res = await c.env.ASSETS.fetch(new Request(new URL(mdPath, c.url)));
  if (res.status !== 200) return null;
  const body = await res.text();
  const front = body.startsWith('---') ? body.slice(0, body.indexOf('\n---', 3) + 1) : '';
  const m = front.match(/^canonical:\s*["']?([^"'\n]+?)["']?\s*$/m);
  return markdownResponse(c, body, canonicalFor(m ? m[1] : c.path, c.path));
}

// --- test hosts and logging -------------------------------------------------

function isTestHost(hostname, env) {
  const hosts = String(env.TEST_HOSTS || `next.${PRIMARY}`).split(',').map((h) => h.trim().toLowerCase());
  const host = hostname.toLowerCase();
  // Version preview URLs live on workers.dev and must not be indexed either.
  // Local development (`make cf-dev`) counts as a test host too, so the
  // parity script's noindex check means the same thing there.
  return hosts.includes(host) || host.endsWith('.workers.dev') || Boolean(env.DEV_HOST_HEADER);
}

/** One Analytics Engine row per AI-agent request. Never allowed to throw. */
function logAgentHit(env, path, agent, markdown, host) {
  try {
    if (!env.AGENT_HITS) return;
    env.AGENT_HITS.writeDataPoint({
      indexes: [agent],
      blobs: [path, agent, markdown ? 'markdown' : 'html', host],
      doubles: [markdown ? 1 : 0],
    });
  } catch (err) {
    console.error('wasmcloud-www: analytics write failed', err);
  }
}
