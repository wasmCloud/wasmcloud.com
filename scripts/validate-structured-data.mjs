#!/usr/bin/env node
/**
 * M10 — Structured data validator.
 *
 * Walks the Docusaurus production build at ./build and validates every
 * `<script type="application/ld+json">` payload across the site:
 *   - JSON.parse succeeds
 *   - Root nodes carry @context + @type (or @graph)
 *   - Article-family nodes have headline + datePublished
 *   - Article-family nodes have about/mentions when M12 frontmatter is
 *     expected (warning, not failure — surfaces authoring gaps without
 *     blocking unrelated PRs)
 *
 * Modes:
 *   --pr <baseRef>     Incremental: only check pages whose route is
 *                       reachable from files changed vs baseRef.
 *   (default)          Full: every HTML file under build/.
 *
 * Exit codes: 0 = all checks passed, 1 = errors, 2 = build artifact missing.
 *
 * Usage in CI:
 *   On PR:   node scripts/validate-structured-data.mjs --pr origin/main
 *   On main: node scripts/validate-structured-data.mjs
 *   Nightly: node scripts/validate-structured-data.mjs
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const BUILD_DIR = join(process.cwd(), 'build');
// Helmet emits attributes unquoted in production HTML (type=application/ld+json),
// so we tolerate quoted, single-quoted, and unquoted attribute forms. The
// negative-lookahead-style filtering happens via the optional-quote group.
const SCRIPT_RE = /<script[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;
const ARTICLE_TYPES = new Set([
  'Article',
  'BlogPosting',
  'NewsArticle',
  'TechArticle',
]);

const isPrMode = process.argv.includes('--pr');
const prBaseRefIdx = process.argv.indexOf('--pr');
const prBaseRef =
  isPrMode && prBaseRefIdx >= 0 ? process.argv[prBaseRefIdx + 1] : undefined;

// --json-summary <path> writes a machine-readable JSON file next to the
// console output. Used by the CI workflow to drive sticky PR comments.
const jsonSummaryIdx = process.argv.indexOf('--json-summary');
const jsonSummaryPath =
  jsonSummaryIdx >= 0 ? process.argv[jsonSummaryIdx + 1] : undefined;

function fail(msg) {
  console.error(`\n${msg}\n`);
  process.exit(2);
}

if (!existsSync(BUILD_DIR)) {
  fail(`build/ not found at ${BUILD_DIR}. Run \`npm run build\` first.`);
}

/** Collect every *.html under build/ */
async function* walkHtml(root) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtml(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

/** Best-effort PR mode: derive changed routes from changed files. */
function changedRoutesFromGit(baseRef) {
  try {
    const out = execFileSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], {
      encoding: 'utf8',
    });
    const files = out.split('\n').filter(Boolean);
    const routes = new Set();
    for (const f of files) {
      // Heuristics map source files → likely route paths. Conservative: any
      // change to docs/blog/community produces only the specific route's
      // HTML being re-validated; any change to src/theme/wasmcloud/* triggers
      // a full sweep (safer because theme changes affect everything).
      if (f.startsWith('src/theme/')) return null; // signal: full sweep
      if (f.startsWith('docs/')) {
        const slug = f
          .replace(/^docs\//, '')
          .replace(/\/index\.mdx?$/, '/')
          .replace(/\.mdx?$/, '/');
        routes.add('/docs/' + slug);
      } else if (f.startsWith('blog/')) {
        const slug = f.replace(/^blog\//, '').replace(/\/index\.mdx?$/, '/');
        routes.add('/blog/' + slug);
      } else if (f.startsWith('community/')) {
        const slug = f.replace(/^community\//, '').replace(/\.mdx?$/, '/');
        routes.add('/community/' + slug);
      } else if (f.startsWith('src/pages/')) {
        const slug = f
          .replace(/^src\/pages\//, '')
          .replace(/\/index\.(tsx?|mdx?|jsx?)$/, '/')
          .replace(/\.(tsx?|mdx?|jsx?)$/, '/');
        routes.add('/' + slug);
      }
    }
    return routes;
  } catch (err) {
    console.warn(`[validate-structured-data] git diff failed: ${err.message}`);
    return null; // fall back to full sweep
  }
}

function fileMatchesRoute(buildFilePath, routes) {
  if (!routes) return true;
  const rel = relative(BUILD_DIR, buildFilePath);
  // route /docs/foo/ corresponds to build/docs/foo/index.html
  for (const route of routes) {
    const expected = (route.endsWith('/') ? route + 'index.html' : route + '/index.html').replace(/^\//, '');
    if (rel === expected) return true;
  }
  return false;
}

/** Per-payload checks */
function validatePayload(payload, ctx) {
  const errors = [];
  const warnings = [];

  const visit = (node, path) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((n, i) => visit(n, `${path}[${i}]`));
      return;
    }
    const type = node['@type'];
    if (typeof type === 'string' && ARTICLE_TYPES.has(type)) {
      if (!node.headline) errors.push(`${ctx} ${path} ${type}: missing headline`);
      if (!node.datePublished && !node.dateModified) {
        errors.push(`${ctx} ${path} ${type}: missing datePublished and dateModified`);
      }
      if (!node.about && !node.mentions) {
        // Soft warning — entity refs from M12 are highly recommended on
        // Article-family pages but not required for valid schema.
        warnings.push(`${ctx} ${path} ${type}: no about or mentions (M12 entity refs)`);
      }
    }
    // Recurse into common nesting points
    if (node.mainEntity) visit(node.mainEntity, `${path}.mainEntity`);
    if (node.hasPart) visit(node.hasPart, `${path}.hasPart`);
    if (node['@graph']) visit(node['@graph'], `${path}.@graph`);
  };

  // Root must carry @type or @graph. @context is required when the payload
  // is a single object, but a top-level ARRAY of typed nodes (e.g. an array
  // of SiteNavigationElement) is a legitimate Schema.org pattern — the
  // @context can be carried by the wrapping document, the consuming RDF
  // parser, or just implied. So:
  //   - Object payload → require @context AND (@type or @graph)
  //   - Array payload  → require each element to be a typed object (has
  //     @type), do NOT require @context on individual elements
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      errors.push(`${ctx} root: empty array`);
    }
    payload.forEach((node, i) => {
      if (!node || typeof node !== 'object') {
        errors.push(`${ctx} root[${i}]: not an object`);
        return;
      }
      if (!('@type' in node)) {
        errors.push(`${ctx} root[${i}]: missing @type`);
      }
      visit(node, `$[${i}]`);
    });
  } else {
    if (payload === null || typeof payload !== 'object') {
      errors.push(`${ctx} root: not an object`);
    } else {
      if (!('@context' in payload)) errors.push(`${ctx} root: missing @context`);
      if (!('@type' in payload) && !('@graph' in payload)) {
        errors.push(`${ctx} root: missing @type / @graph`);
      }
      visit(payload, '$');
    }
  }
  return { errors, warnings };
}

// Pages that opt out of search indexing with `<meta name="robots" content="noindex...">`
// are intentionally not eligible for rich results. Soft warnings about authoring
// gaps (e.g. missing M12 about/mentions) provide zero SEO value on these pages,
// so we suppress them. Hard schema-validity errors still fire — invalid JSON-LD
// is invalid regardless of indexability.
// Tolerate other attributes before `name=` (e.g. react-helmet emits
// `data-rh=true name=robots content=...`) and quoted/unquoted attribute
// values. The key signal is `name=robots` + `content` containing `noindex`.
const NOINDEX_META_RE = /<meta[^>]*\bname=["']?robots["']?[^>]*\bcontent=["'][^"']*noindex/i;

async function validateFile(htmlPath) {
  const html = await readFile(htmlPath, 'utf8');
  const isNoindex = NOINDEX_META_RE.test(html);
  const errors = [];
  const warnings = [];
  let count = 0;
  let m;
  SCRIPT_RE.lastIndex = 0;
  while ((m = SCRIPT_RE.exec(html))) {
    count += 1;
    const raw = m[1].trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      errors.push(`${htmlPath} script #${count}: JSON.parse failed (${e.message})`);
      continue;
    }
    const r = validatePayload(parsed, `${htmlPath} script #${count}`);
    errors.push(...r.errors);
    if (!isNoindex) warnings.push(...r.warnings);
  }
  return { count, errors, warnings };
}

async function main() {
  const routes = isPrMode && prBaseRef ? changedRoutesFromGit(prBaseRef) : null;
  if (isPrMode) {
    console.log(
      `[validate-structured-data] PR mode against ${prBaseRef}: ${routes ? `${routes.size} route(s) changed` : 'theme change detected → full sweep'}`,
    );
  } else {
    console.log('[validate-structured-data] full sweep mode');
  }
  let totalFiles = 0;
  let totalScripts = 0;
  const allErrors = [];
  const allWarnings = [];

  for await (const htmlPath of walkHtml(BUILD_DIR)) {
    if (!fileMatchesRoute(htmlPath, routes)) continue;
    totalFiles += 1;
    const r = await validateFile(htmlPath);
    totalScripts += r.count;
    allErrors.push(...r.errors);
    allWarnings.push(...r.warnings);
  }

  console.log(
    `\n[validate-structured-data] checked ${totalFiles} HTML file(s), ${totalScripts} JSON-LD payload(s)`,
  );
  if (allWarnings.length > 0) {
    console.warn(`\n${allWarnings.length} warning(s) (not failing build):`);
    for (const w of allWarnings.slice(0, 50)) console.warn(`  WARN ${w}`);
    if (allWarnings.length > 50) console.warn(`  ... +${allWarnings.length - 50} more`);
  }
  if (allErrors.length > 0) {
    console.error(`\n${allErrors.length} error(s):`);
    for (const e of allErrors.slice(0, 50)) console.error(`  ERR ${e}`);
    if (allErrors.length > 50) console.error(`  ... +${allErrors.length - 50} more`);
  }

  // Bucket warnings by category for the PR comment summary. Each warning
  // string has the shape: "<file> $ <type>: <message>". Strip the file
  // prefix and bucket by the trailing message.
  function summarize(list) {
    const byKind = {};
    for (const w of list) {
      const colonIdx = w.indexOf(': ');
      const kind = colonIdx >= 0 ? w.slice(colonIdx + 2).trim() : w;
      byKind[kind] = (byKind[kind] || 0) + 1;
    }
    return Object.entries(byKind)
      .sort((a, b) => b[1] - a[1])
      .map(([kind, count]) => ({ kind, count }));
  }

  const summary = {
    mode: isPrMode ? 'pr' : 'full',
    base_ref: prBaseRef || null,
    files_checked: totalFiles,
    payloads_checked: totalScripts,
    error_count: allErrors.length,
    warning_count: allWarnings.length,
    errors_by_kind: summarize(allErrors),
    warnings_by_kind: summarize(allWarnings),
    sample_errors: allErrors.slice(0, 20),
    sample_warnings: allWarnings.slice(0, 20),
  };

  if (jsonSummaryPath) {
    const { writeFile, mkdir } = await import('node:fs/promises');
    const { dirname } = await import('node:path');
    await mkdir(dirname(jsonSummaryPath), { recursive: true });
    await writeFile(jsonSummaryPath, JSON.stringify(summary, null, 2));
    console.log(`[validate-structured-data] summary written → ${jsonSummaryPath}`);
  }

  if (allErrors.length > 0) {
    process.exit(1);
  }
  console.log('[validate-structured-data] OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
