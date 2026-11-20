// node --test worker/test/router.test.mjs
// The matching semantics, pinned against behaviour observed on production.
// Needs worker/routes.generated.json: run `make cf` (or netlify2cf.py) first.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  collapse, headersFor, isSearchCrawler, markdownAlternate, markdownTokens, matchAgent, matchRule,
  mdPageCandidates, norm, parseAliases, pickRule,
} from '../src/router.js';

const load = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const table = load('../routes.generated.json');
const agents = load('../agents.json');
const hit = (path, host = 'wasmcloud.com') => {
  const m = matchRule(table.rules, path, host);
  return m && [m.rule.status, m.target];
};

test('collapse and norm', () => {
  assert.equal(collapse('//install//'), '/install/');
  assert.equal(norm('/install/'), '/install');
  assert.equal(norm('/'), '/');
});

test('/x and /x/ match the same rule, and repeated slashes collapse', () => {
  assert.deepEqual(hit('/install'), [301, '/docs/installation/']);
  assert.deepEqual(hit('/install/'), [301, '/docs/installation/']);
  assert.deepEqual(hit('/install//'), [301, '/docs/installation/']);
  assert.deepEqual(hit('//install'), [301, '/docs/installation/']);
});

test('matching is case-sensitive', () => {
  assert.equal(hit('/Install'), null);
  assert.deepEqual(hit('/Examples/Typescript'),
    [301, '/docs/wash/developer-guide/language-support/typescript/']);
});

test('302s stay 302s, external redirects keep their host, fragments survive', () => {
  assert.deepEqual(hit('/innovation-day'),
    [302, '/blog/2024-09-24-wasmcloud-innovation-day-2024-in-review/']);
  assert.deepEqual(hit('/slack'), [301, 'https://slack.wasmcloud.com']);
  assert.deepEqual(hit('/docs/cli/app'), [301, '/docs/v1/cli/wash/#wash-app']);
  assert.deepEqual(hit('/docs/v1/wash/get-started'), [301, '/docs/v1/installation/']);
});

test('splats carry the rest of the path; a specific rule above still wins', () => {
  assert.deepEqual(hit('/docs/next/foo/bar'), [301, '/docs/v1/foo/bar']);
  // A splat rule also matches its bare stem, with an empty splat.
  assert.deepEqual(hit('/docs/tour'), [301, '/docs/v1/tour/']);
  // /docs/next has its own rule above the splat: /docs/v1/ is not a page.
  assert.deepEqual(hit('/docs/next'), [301, '/docs/v1/intro/']);
  assert.deepEqual(hit('/docs/v1/'), [301, '/docs/v1/intro/']);
  assert.deepEqual(hit('/docs/tour/hello-world/'), [301, '/docs/v1/tour/hello-world/']);
  // /docs/cli/app has its own rule above the /docs/cli/* splat.
  assert.deepEqual(hit('/docs/cli/unknown-subcommand'), [301, '/docs/v1/cli/unknown-subcommand']);
});

test('a splat is copied, never expanded as a replacement pattern', () => {
  assert.deepEqual(hit("/docs/next/a$&b/$'c/$$"), [301, "/docs/v1/a$&b/$'c/$$"]);
});

test('a host-scoped rule exists only on its host', () => {
  assert.deepEqual(hit('/', 'docs.wasmcloud.com'), [301, 'https://wasmcloud.com/docs/overview/']);
  assert.deepEqual(hit('/docs/foo', 'docs.wasmcloud.com'), [301, 'https://wasmcloud.com/docs/foo']);
  assert.deepEqual(hit('/foo/bar', 'docs.wasmcloud.com'), [301, 'https://wasmcloud.com/docs/foo/bar']);
  assert.deepEqual(hit('/robots.txt', 'docs.wasmcloud.com'), [301, 'https://wasmcloud.com/docs/robots.txt']);
  assert.equal(hit('/', 'wasmcloud.com'), null);
  assert.equal(hit('/foo/bar', 'wasmcloud.com'), null);
});

test('the docs.wasmcloud.com rules are forced, so no file shadows them', async () => {
  const fileExists = async () => true;
  const m = await pickRule(table.rules, '/robots.txt', 'docs.wasmcloud.com', fileExists);
  assert.equal(m.target, 'https://wasmcloud.com/docs/robots.txt');
});

test('an unforced rule yields to a file: /docs is a page, not a redirect', async () => {
  let asked = 0;
  const yes = async () => { asked += 1; return true; };
  assert.equal(await pickRule(table.rules, '/docs', 'wasmcloud.com', yes), null);
  assert.equal(asked, 1);
  const m = await pickRule(table.rules, '/docs', 'wasmcloud.com', async () => false);
  assert.deepEqual([m.rule.status, m.target], [301, '/docs/overview/']);
});

test('no rule matched means the file check is never made', async () => {
  let asked = 0;
  assert.equal(await pickRule(table.rules, '/docs/overview/', 'wasmcloud.com',
    async () => { asked += 1; return true; }), null);
  assert.equal(asked, 0);
});

test('every rule is a redirect the engine implements', () => {
  for (const r of table.rules) {
    assert.ok([301, 302, 303, 307, 308].includes(r.status), `rule #${r.n}: ${r.status}`);
    assert.ok(r.to.startsWith('/') || r.to.startsWith('https://'), `rule #${r.n}: ${r.to}`);
  }
});

test('headers: every matching block applies, globs reach nested paths', () => {
  const names = (path) => headersFor(table.headers, path).map(([n]) => n.toLowerCase()).sort();
  const page = names('/docs/overview/');
  for (const n of ['x-frame-options', 'x-content-type-options', 'referrer-policy',
    'permissions-policy', 'strict-transport-security', 'content-security-policy-report-only']) {
    assert.ok(page.includes(n), n);
  }
  assert.ok(!page.includes('content-type'));
  assert.ok(names('/docs/glossary.md').includes('content-type'));
  assert.ok(names('/docs/wash/developer-guide/index.md').includes('content-type'));
  assert.ok(!names('/blog/post.md').includes('content-type'));
});

test('the CSP from netlify.toml is one line with single spaces', () => {
  const csp = headersFor(table.headers, '/').find(([n]) => n === 'Content-Security-Policy-Report-Only')[1];
  assert.ok(csp.startsWith("default-src 'self'; script-src 'self' 'unsafe-inline' https://"));
  assert.ok(!/\s{2,}|\n/.test(csp));
  assert.ok(csp.endsWith("form-action 'self'"));
});

test('host aliases', () => {
  const a = parseAliases('docs-next.wasmcloud.com=docs.wasmcloud.com, A.example=B.example');
  assert.equal(a.get('docs-next.wasmcloud.com'), 'docs.wasmcloud.com');
  assert.equal(a.get('a.example'), 'b.example');
  assert.equal(parseAliases(undefined).size, 0);
});

test('AI agents are matched by User-Agent; search crawlers never are', () => {
  assert.equal(matchAgent(agents, 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)'), 'GPTBot');
  assert.equal(matchAgent(agents, 'Mozilla/5.0 ClaudeBot/1.0'), 'ClaudeBot');
  assert.equal(matchAgent(agents, 'Mozilla/5.0 (Macintosh) Chrome/131.0 Safari/537.36'), null);
  assert.equal(matchAgent(agents, 'Mozilla/5.0 (compatible; Googlebot/2.1)'), null);
  assert.equal(matchAgent(agents, ''), null);
  assert.ok(isSearchCrawler(agents, 'Mozilla/5.0 (compatible; bingbot/2.0)'));
  assert.ok(!isSearchCrawler(agents, 'Mozilla/5.0 (compatible; GPTBot/1.2)'));
});

test('Googlebot and Bingbot are never in the agent list', () => {
  for (const a of agents.agents) assert.ok(!/google|bing/i.test(a), a);
  for (const n of ['Googlebot', 'bingbot']) assert.ok(agents.never.includes(n), n);
});

test('.md URLs lead to a page, and the advertised one leads back', () => {
  assert.deepEqual(mdPageCandidates('/docs/faq.md'), ['/docs/faq/', '/docs/faq']);
  assert.deepEqual(mdPageCandidates('/docs/faq/index.md'), ['/docs/faq/', '/docs/faq/index.html']);
  assert.deepEqual(mdPageCandidates('/index.md'), ['/']);
  assert.deepEqual(mdPageCandidates('/docs/faq/'), []);
  for (const page of ['/', '/docs/faq/', '/docs/faq', '/docs/faq/index.html']) {
    const md = markdownAlternate(page);
    assert.ok(mdPageCandidates(md).length > 0, md);
  }
  assert.equal(markdownAlternate('/'), '/index.md');
  assert.equal(markdownAlternate('/docs/faq/'), '/docs/faq/index.md');
  assert.equal(markdownAlternate('/404'), '/404/index.md');
});

test('token estimate is UTF-8 bytes over four, rounded up', () => {
  assert.equal(markdownTokens(''), 0);
  assert.equal(markdownTokens('abcde'), 2);
  assert.equal(markdownTokens('é'), 1);
});

test('a page\'s .md URL is not captured by an unforced splat rule', async () => {
  // /docs/examples/ is a live page; /docs/examples/* is the rule for the v1
  // pages that used to sit under it. The Worker tells pickRule a file exists
  // when the .md URL stands for a page with a Markdown twin (index.js).
  assert.ok(table.twins.includes('/docs/examples/index.html'));
  assert.deepEqual(mdPageCandidates('/docs/examples/index.md'), ['/docs/examples/', '/docs/examples/index.html']);
  const withoutTwin = await pickRule(table.rules, '/docs/examples/index.md', 'wasmcloud.com', async () => false);
  assert.equal(withoutTwin.target, '/docs/v1/examples/index.md');
  assert.equal(await pickRule(table.rules, '/docs/examples/index.md', 'wasmcloud.com', async () => true), null);
});

test('hashed files under /assets/ are immutable, and nothing else is', () => {
  const cache = (path) => new Map(headersFor(table.headers, path).map(([n, v]) => [n.toLowerCase(), v])).get('cache-control');
  assert.equal(cache('/assets/js/main.a1143984.js'), 'public, max-age=31536000, immutable');
  assert.equal(cache('/docs/overview/'), undefined);
  assert.equal(cache('/img/logo.svg'), undefined);
});
