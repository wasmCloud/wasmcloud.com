#!/usr/bin/env node
/**
 * Renders a wasmCloud release blog header in the established series style.
 *
 * An alternative to the nano-banana path in generate-default-heroes.mjs for
 * the release-announcement headers specifically, which are geometric and
 * typographic rather than illustrative, and so can be built deterministically.
 *
 * Geometry is matched against blog/2026-09-23-wasmcloud-2.10.0/images/
 * 2.10-blog-header.webp, measured by ink bounding box:
 *
 *   logo mark   x 190-339 (w 150)   y 210-380 (h 171)
 *   wordmark    x 386-1001 (w 616)  y 252-340 (h 89)
 *   numeral     x 185-...           y 533-823 (h 291 cap height)
 *   pill row    y 1020-1045, widths 150/94/58/36/24, gaps 28
 *
 * Colours are sampled from that file rather than taken from the brand doc:
 * the mark keeps the logo asset's own #00bc8e while the numeral is Green
 * Aqua #00c488, which the palette alone would not tell you.
 *
 * The right-hand hexagon composition is the element that varies per release
 * (2.9 used an isometric cluster, 2.10 two sparse hexagons, 2.11 concentric
 * rings). Edit `composition()` for a new release; leave the lockup, numeral
 * metrics, and pill row alone so the series stays recognisable.
 *
 * Usage:
 *   node scripts/generate-release-header.mjs 2.12
 *   node scripts/generate-release-header.mjs 2.12 --out path/to/header.webp
 *   node scripts/generate-release-header.mjs 2.12 --measure   # print ink boxes
 *
 * Writes WebP at quality 90 (~45 KB; siblings are 38-48 KB). Requires
 * `scripts/node_modules` (playwright + its chromium) and the repo's sharp.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from '../node_modules/sharp/lib/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const CACHE = join(HERE, '.cache');

const argv = process.argv.slice(2);
const VERSION = argv.find((a) => !a.startsWith('--')) ?? '2.11';
const outFlag = argv.indexOf('--out');
const OUT = outFlag !== -1 ? resolve(argv[outFlag + 1]) : join(CACHE, `${VERSION}-blog-header.webp`);
const MEASURE = argv.includes('--measure');

const W = 2400;
const H = 1260;

const AQUA = '#00c488';
const MARK_GREEN = '#00bc8e';
const YELLOW = '#ffb600';
const GAINSBORO = '#d8e1e2';
const SLATE = '#395d7c';
const MUTED_GREEN = '#1a9f7d';

// Lexend latin subset, variable. Cached so repeat runs work offline.
const FONT_URL = 'https://fonts.gstatic.com/s/lexend/v26/wlpwgwvFAVdoq2_v-6QU82RHaA.woff2';
async function lexendBase64() {
  return (await cached('lexend-latin.woff2', FONT_URL)).toString('base64');
}

// The official horizontal lockup: mark in #00bc8e plus the wordmark drawn as
// outlines in #fff, so the wordmark needs no font. static/logo/ carries only
// the mark, so this comes from the CNCF artwork repo, the canonical source for
// CNCF project marks. Vendor it under static/logo/ if you would rather not
// depend on the network.
const LOCKUP_URL =
  'https://raw.githubusercontent.com/cncf/artwork/main/projects/wasmcloud/horizontal/white/wasmcloud.logo-hrztl_color.inversed.svg';

async function cached(name, url) {
  await mkdir(CACHE, { recursive: true });
  const file = join(CACHE, name);
  try {
    await stat(file);
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed for ${name}: ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(file);
}

/**
 * Inlines the lockup. Its fills come from a <style> block keyed on .cls-N,
 * which would leak into the page and collide, so they are rewritten as fill
 * attributes and the block dropped.
 */
async function lockupInline() {
  const raw = (await cached('wasmcloud-horizontal.svg', LOCKUP_URL)).toString('utf8');
  const classFills = new Map();
  for (const [, cls, fill] of raw.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*([^;}]+)\s*;?\s*\}/g)) {
    classFills.set(cls, fill.trim());
  }
  if (classFills.size === 0) throw new Error('lockup: no class fills found; asset shape changed');
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error('lockup: no viewBox');
  const body = raw
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/class="(cls-\d+)"/g, (_, cls) => `fill="${classFills.get(cls) ?? '#fff'}"`);
  return { viewBox, body };
}

/** Pointy-top regular hexagon: width = r*sqrt(3), height = 2r. */
function hex(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (90 + i * 60);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy - r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/** The per-release element. Swap this for a new release. */
function composition() {
  return `
  <polygon points="${hex(1520, 250, 330)}" fill="#ffffff" fill-opacity="0.028"/>
  <polygon points="${hex(1700, 555, 412)}" fill="none" stroke="#00c389" stroke-opacity="0.24" stroke-width="3"/>
  <polygon points="${hex(1700, 555, 312)}" fill="none" stroke="#ffffff" stroke-opacity="0.09" stroke-width="2"/>
  <polygon points="${hex(1700, 555, 212)}" fill="url(#tealFill)" stroke="#00c389" stroke-opacity="0.18" stroke-width="2"/>
  <polygon points="${hex(2010, 880, 250)}" fill="url(#tealFill2)" stroke="#00c389" stroke-opacity="0.20" stroke-width="2"/>`;
}

const lockup = await lockupInline();
const fontB64 = await lexendBase64();

// The lockup's hexagon spans the full viewBox height, so scaling the whole
// lockup until that height is 171px reproduces the reference mark's 150x171.
const LOCKUP_H = 171;
const [, , vbW, vbH] = lockup.viewBox.split(/\s+/).map(Number);
const LOCKUP_W = (vbW / vbH) * LOCKUP_H;

const pills = [
  { w: 150, x: 205, fill: AQUA },
  { w: 94, x: 382, fill: MUTED_GREEN },
  { w: 58, x: 504, fill: YELLOW },
  { w: 36, x: 590, fill: GAINSBORO },
  { w: 24, x: 653, fill: SLATE },
];

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family:'Lexend'; src:url(data:font/woff2;base64,${fontB64}) format('woff2');
               font-weight:100 900; font-display:block; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px}
  body{position:relative;overflow:hidden;font-family:'Lexend',Arial,sans-serif;background:#001c3e}
  #bg{position:absolute;inset:0}
  #lockup{position:absolute;left:190px;top:210px;height:${LOCKUP_H}px;width:${LOCKUP_W.toFixed(1)}px}
  #lockup svg{display:block;width:100%;height:100%}
  #version{position:absolute;left:180px;top:471px;font-size:400px;font-weight:800;line-height:1;
           color:${AQUA};letter-spacing:-0.028em;white-space:nowrap}
  .pill{position:absolute;top:1020px;height:26px;border-radius:13px}
</style></head><body>
<svg id="bg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0.1" x2="1" y2="0.8">
      <stop offset="0" stop-color="#001c3e"/><stop offset="0.45" stop-color="#002a56"/><stop offset="1" stop-color="#0a4375"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.45" r="0.55">
      <stop offset="0" stop-color="#0d4b80" stop-opacity="0.55"/><stop offset="1" stop-color="#0d4b80" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tealFill" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#00c389" stop-opacity="0.20"/><stop offset="1" stop-color="#00c389" stop-opacity="0.04"/>
    </linearGradient>
    <linearGradient id="tealFill2" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#0a9c87" stop-opacity="0.26"/><stop offset="1" stop-color="#0a9c87" stop-opacity="0.06"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <polygon points="${hex(330, 840, 440)}" fill="#ffffff" fill-opacity="0.035"/>
  ${composition()}
  <polygon points="${hex(200, 620, 640)}" fill="none" stroke="#00c389" stroke-opacity="0.20" stroke-width="2.5"/>
</svg>
<div id="lockup"><svg viewBox="${lockup.viewBox}" xmlns="http://www.w3.org/2000/svg">${lockup.body}</svg></div>
<div id="version">${VERSION}</div>
${pills.map((p) => `<div class="pill" style="left:${p.x}px;width:${p.w}px;background:${p.fill}"></div>`).join('')}
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

await mkdir(dirname(OUT), { recursive: true });
const info = await sharp(png).flatten({ background: '#001c3e' }).webp({ quality: 90 }).toFile(OUT);
console.log(`wrote ${OUT} (${info.size} B, ${info.width}x${info.height})`);

if (MEASURE) {
  const { data, info: meta } = await sharp(OUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const i = (y * meta.width + x) * meta.channels; return [data[i], data[i + 1], data[i + 2]]; };
  const box = (name, x0, y0, x1, y1, pred) => {
    let mnx = 1e9, mny = 1e9, mxx = -1, mxy = -1;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const [r, g, b] = at(x, y);
      if (pred(r, g, b)) { mnx = Math.min(mnx, x); mny = Math.min(mny, y); mxx = Math.max(mxx, x); mxy = Math.max(mxy, y); }
    }
    console.log(`  ${name.padEnd(9)} x ${mnx}-${mxx} (w=${mxx - mnx + 1})  y ${mny}-${mxy} (h=${mxy - mny + 1})`);
  };
  console.log('ink boxes (compare with the header of this file):');
  box('mark', 150, 180, 380, 400, (r, g, b) => g > 150 && r < 80 && b > 100 && b < 170);
  box('wordmark', 380, 180, 1150, 400, (r, g, b) => r > 230 && g > 230 && b > 230);
  box('numeral', 150, 440, 1150, 980, (r, g, b) => g > 170 && r < 80 && b > 110 && b < 170);
}
