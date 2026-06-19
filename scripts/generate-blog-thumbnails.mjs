#!/usr/bin/env node
/**
 * Build-time copier for blog-post hero thumbnails referenced by
 * `/people/<slug>/` profile pages.
 *
 * The Docusaurus blog plugin processes co-located `image:` frontmatter
 * paths (e.g. `./images/setup-wash-header.webp`) through webpack at
 * render time, so the post's `assets.image` URL is only known inside a
 * blog-post render context. The people-pages plugin runs outside that
 * context and can't predict the processed URL. Copying the hero images
 * to `static/blog-thumbs/<dir>/<rel>` gives a stable URL that
 * Docusaurus serves verbatim (`static/` is published at the site root).
 *
 * Only the post's `image:` field is copied — not every asset under the
 * post's `images/` directory — so the duplication footprint is exactly
 * one hero per post.
 *
 * Idempotent. Safe to run before every build (wired into package.json's
 * `prestart` and `prebuild`).
 */
import {
  readdir,
  readFile,
  copyFile,
  mkdir,
  stat,
} from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = join(REPO_ROOT, 'blog');
const OUT_ROOT = join(REPO_ROOT, 'static', 'blog-thumbs');

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/;
const INDEX_NAMES = ['index.mdx', 'index.md'];

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readFrontmatter(filePath) {
  const text = await readFile(filePath, 'utf8');
  const m = FRONTMATTER_RE.exec(text);
  if (!m) return null;
  try {
    const fm = yaml.load(m[1]);
    return fm && typeof fm === 'object' ? fm : null;
  } catch {
    return null;
  }
}

async function main() {
  const entries = await readdir(BLOG_DIR, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;
  let absolute = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_')) continue;

    const dirPath = join(BLOG_DIR, entry.name);
    let indexPath = null;
    for (const name of INDEX_NAMES) {
      if (await fileExists(join(dirPath, name))) {
        indexPath = join(dirPath, name);
        break;
      }
    }
    if (!indexPath) continue;

    const fm = await readFrontmatter(indexPath);
    if (!fm || typeof fm.image !== 'string' || fm.image.length === 0) continue;

    // Absolute URLs (YouTube thumbnails, etc.) need no copy.
    if (/^https?:\/\//.test(fm.image) || fm.image.startsWith('/')) {
      absolute += 1;
      continue;
    }

    const rel = fm.image.replace(/^\.\//, '');
    const src = join(dirPath, rel);
    const dest = join(OUT_ROOT, entry.name, rel);

    if (!(await fileExists(src))) {
      console.warn(
        `[blog-thumbs] missing source ${src.replace(REPO_ROOT + '/', '')} (referenced by ${entry.name})`,
      );
      skipped += 1;
      continue;
    }

    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
    copied += 1;
  }

  console.log(
    `[blog-thumbs] copied ${copied} hero images → ${OUT_ROOT.replace(REPO_ROOT + '/', '')} (${absolute} absolute URLs left in place; ${skipped} missing sources)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
