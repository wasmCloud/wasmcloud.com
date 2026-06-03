#!/usr/bin/env node
/**
 * M3 — Build-time image transformer for blog post heroes.
 *
 * Walks blog/<post>/ directories looking for a hero image (named `hero.png`
 * or `hero.jpg` by default; configurable via `--hero <filename>`). For each
 * source image of ≥1200×675 it generates three Article-compatible variants:
 *   - hero-16x9.<ext> at 1920×1080  (16:9)
 *   - hero-4x3.<ext>  at 1600×1200  (4:3)
 *   - hero-1x1.<ext>  at 1200×1200  (1:1)
 *
 * The transformer caches outputs by source-file mtime so unchanged heroes
 * skip work on subsequent runs.
 *
 * Posts that lack a hero get a default hero assigned by topic cluster
 * (see `static/default-heroes/` — generated separately via nano-banana,
 * see scripts/generate-default-heroes.mjs).
 *
 * Usage:
 *   node scripts/transform-blog-images.mjs              # all posts
 *   node scripts/transform-blog-images.mjs --post 2026-06-03-foo
 *   node scripts/transform-blog-images.mjs --hero featured.png
 *   node scripts/transform-blog-images.mjs --audit       # report only, no writes
 *
 * Dependencies: `sharp` (run `npm i -D sharp` once before first execution).
 */
import { readdir, stat, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'blog');
const DEFAULT_HERO_DIR = join(ROOT, 'static', 'default-heroes');

const HERO_NAMES = ['hero.png', 'hero.jpg', 'hero.jpeg', 'hero.webp'];
const MIN_SOURCE_WIDTH = 1200;
const MIN_SOURCE_HEIGHT = 675;

const RATIOS = [
  { name: '16x9', width: 1920, height: 1080 },
  { name: '4x3', width: 1600, height: 1200 },
  { name: '1x1', width: 1200, height: 1200 },
];

const argv = process.argv.slice(2);
const auditOnly = argv.includes('--audit');
const heroArg = argv.indexOf('--hero');
const heroNameOverride = heroArg >= 0 ? argv[heroArg + 1] : undefined;
const postArg = argv.indexOf('--post');
const postFilter = postArg >= 0 ? argv[postArg + 1] : undefined;

const HERO_CANDIDATES = heroNameOverride ? [heroNameOverride] : HERO_NAMES;

let sharp;
async function getSharp() {
  if (sharp) return sharp;
  try {
    ({ default: sharp } = await import('sharp'));
    return sharp;
  } catch {
    console.error(
      '\n[transform-blog-images] sharp is not installed. Install with:\n  npm install --save-dev sharp\n',
    );
    process.exit(2);
  }
}

async function findHero(postDir) {
  for (const candidate of HERO_CANDIDATES) {
    const full = join(postDir, 'images', candidate);
    if (existsSync(full)) return full;
    const fullLoose = join(postDir, candidate);
    if (existsSync(fullLoose)) return fullLoose;
  }
  return null;
}

async function transform(postDir, source) {
  const s = await getSharp();
  const meta = await s(source).metadata();
  if (!meta.width || !meta.height) {
    return { post: basename(postDir), status: 'meta-missing', source };
  }
  if (meta.width < MIN_SOURCE_WIDTH || meta.height < MIN_SOURCE_HEIGHT) {
    return {
      post: basename(postDir),
      status: 'too-small',
      source,
      have: `${meta.width}x${meta.height}`,
      want: `${MIN_SOURCE_WIDTH}x${MIN_SOURCE_HEIGHT}`,
    };
  }
  if (auditOnly) {
    return { post: basename(postDir), status: 'ok', source, dims: `${meta.width}x${meta.height}` };
  }
  const outDir = join(postDir, 'images');
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });
  const ext = extname(source) || '.png';
  const written = [];
  for (const ratio of RATIOS) {
    const outFile = join(outDir, `hero-${ratio.name}${ext}`);
    const sourceMtime = (await stat(source)).mtimeMs;
    if (existsSync(outFile)) {
      const outMtime = (await stat(outFile)).mtimeMs;
      if (outMtime >= sourceMtime) continue; // cached
    }
    await s(source)
      .resize(ratio.width, ratio.height, { fit: 'cover', position: 'attention' })
      .toFile(outFile);
    written.push(outFile);
  }
  return { post: basename(postDir), status: 'transformed', source, written };
}

async function assignDefault(postDir) {
  // Soft fallback: if a post has no hero AND a default exists in static/,
  // copy hero-16x9 from the generic default to satisfy the Article schema
  // until the post gets a custom hero. Topic-cluster assignment requires
  // a frontmatter read (skipped here to keep the script simple); the
  // generic wasmCloud default ships in static/default-heroes/generic/.
  const defaultDir = join(DEFAULT_HERO_DIR, 'generic');
  if (!existsSync(defaultDir)) {
    return { post: basename(postDir), status: 'no-hero-no-default' };
  }
  if (auditOnly) return { post: basename(postDir), status: 'would-assign-default' };
  const imagesDir = join(postDir, 'images');
  if (!existsSync(imagesDir)) await mkdir(imagesDir, { recursive: true });
  for (const ratio of RATIOS) {
    const src = join(defaultDir, `hero-${ratio.name}.png`);
    if (!existsSync(src)) continue;
    await copyFile(src, join(imagesDir, `hero-${ratio.name}.png`));
  }
  return { post: basename(postDir), status: 'assigned-default' };
}

async function main() {
  if (!existsSync(BLOG_DIR)) {
    console.error(`[transform-blog-images] blog/ not found at ${BLOG_DIR}`);
    process.exit(2);
  }
  const dirs = (await readdir(BLOG_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(d.name))
    .map((d) => join(BLOG_DIR, d.name));
  const targets = postFilter
    ? dirs.filter((d) => basename(d).includes(postFilter))
    : dirs;

  console.log(`[transform-blog-images] ${auditOnly ? 'AUDIT' : 'TRANSFORM'} ${targets.length} post(s)`);
  let ok = 0;
  let tooSmall = 0;
  let noHero = 0;
  let assigned = 0;
  const issues = [];
  for (const dir of targets) {
    const hero = await findHero(dir);
    if (!hero) {
      noHero += 1;
      const r = await assignDefault(dir);
      if (r.status.startsWith('assigned') || r.status === 'would-assign-default') assigned += 1;
      else issues.push(r);
      continue;
    }
    const r = await transform(dir, hero);
    if (r.status === 'transformed' || r.status === 'ok') ok += 1;
    else if (r.status === 'too-small') tooSmall += 1;
    if (r.status !== 'ok' && r.status !== 'transformed') issues.push(r);
  }
  console.log(`\n[transform-blog-images] summary:`);
  console.log(`  posts with valid hero: ${ok}`);
  console.log(`  posts without hero:    ${noHero} (defaults ${assigned ? 'used' : 'unavailable'})`);
  console.log(`  posts with too-small hero: ${tooSmall}`);
  if (issues.length > 0) {
    console.log(`\nissues:`);
    for (const i of issues) console.log(`  ${JSON.stringify(i)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
