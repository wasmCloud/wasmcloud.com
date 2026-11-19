"""Compare two deployments of wasmcloud.com, URL by URL.

The Cloudflare Worker copy at next.wasmcloud.com is only allowed to take
production's place when this reports zero unexplained differences from the
Netlify site at wasmcloud.com. smoke.py asks "does this deploy serve what its
rules say"; this asks "does that deploy answer exactly like this one".

URL set (deduplicated, compared by path on both origins):

  fixed     a short list of paths that have each broken something once
  rules     every redirect source in netlify.toml, with splats filled in
  build     every file in the build the Worker serves (build/assets)
  sitemaps  every wasmcloud.com URL in every sitemap production serves
  extra     --extra-urls FILE, one URL or path per line (the Ahrefs export)

For each URL, with redirects not followed and a desktop Chrome user agent:
status, Location, Content-Type, Cache-Control, every header netlify.toml and
static/_headers set, and a hash of the body. Then the checks only the Worker
has to pass: Markdown for AI agents, untouched HTML for search crawlers,
noindex on the test host and never on production, and time to first byte.

Run `make cf` first: the rule list and the file list are read from its output.

Usage:

    python3 scripts/parity.py                              # prod vs next.wasmcloud.com
    python3 scripts/parity.py --test http://127.0.0.1:8787 # prod vs `make cf-dev`
    python3 scripts/parity.py --limit 80                   # a quick sample
    python3 scripts/parity.py --save build/parity-baseline.json
    python3 scripts/parity.py --baseline build/parity-baseline.json

--save records production's answers. --baseline compares the live --prod
origin against such a file instead of against a second host: that is the rerun
after cutover, when wasmcloud.com *is* the Worker and there is no
Netlify-served hostname left to compare with.

Differences that are understood and accepted go in scripts/parity-allow.txt
with a reason; they are reported as explained and do not fail the run.

Writes a Markdown report (default build/parity-report.md) and exits non-zero
on any unexplained difference.
"""
import argparse
import concurrent.futures
import datetime
import fnmatch
import hashlib
import json
import os
import re
import shlex
import statistics
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *parts: os.path.join(_ROOT, *parts)

# Canonical URLs always name production, whichever host served the page.
CANONICAL_ORIGIN = "https://wasmcloud.com"

CHROME = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
AI_AGENTS = {
    "ChatGPT-User": ("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; "
                     "ChatGPT-User/1.0; +https://openai.com/bot"),
    "GPTBot": ("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; "
               "GPTBot/1.2; +https://openai.com/gptbot)"),
}
# Never served Markdown: giving a search crawler different content from a
# person is cloaking.
CRAWLERS = {
    "Googlebot": ("Mozilla/5.0 (compatible; Googlebot/2.1; "
                  "+http://www.google.com/bot.html)"),
    "Bingbot": ("Mozilla/5.0 (compatible; bingbot/2.0; "
                "+http://www.bing.com/bingbot.htm)"),
}

TIMEOUT = 40
# Files compared without downloading them, unless --full-bodies: the status,
# type, caching and length of an image or a PDF say whether the same file is
# there, and fetching 200 MB of them from production twice says little more.
# They are asked for with `Range: bytes=0-0`.
BINARY = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".pdf", ".mp4",
          ".webm", ".mov", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".zip", ".gz",
          ".wasm", ".excalidraw")
REDIRECTS = (301, 302, 303, 307, 308)
TRANSIENT = (0, 502, 503, 504)
TEXTUAL = ("text/", "application/json", "application/javascript",
           "application/xml", "image/svg+xml", "application/manifest+json")
MISSING = "/parity-probe-missing-page"
NOT_FOUND = [MISSING, MISSING + "/", "/parity-probe/deep/missing.html",
             "/docs/parity-probe-missing-page/", "/blog/parity-probe-missing-page/",
             "/community/parity-probe-missing-page/", "/img/", "/assets"]
# How many rows one check may put in the failure table. A header missing from
# every response is one finding, not two thousand.
ROWS_PER_CHECK = 40


# --------------------------------------------------------------------------
# fetching
# --------------------------------------------------------------------------
# The site is built twice: by Netlify for production and by GitHub Actions (or
# a laptop) for the Worker. The two builds render the same page but are not
# byte-identical, and the two hosts each add one thing to the HTML. These are
# blanked on both sides before hashing, and nothing wider, so everything else
# in the page (text, links, metadata, structured data) is compared exactly.
BUILD_NOISE = [
    # Bundle and chunk file names carry a content hash, and the main bundle
    # bakes in the absolute path of the build directory.
    (re.compile(rb"(/assets/(?:js|css)/[\w~.-]+?)\.[0-9a-f]{8}\.(js|css)"), rb"\1.HASH.\2"),
    # Footnote ids get a per-build suffix (user-content-fn-1-832706).
    (re.compile(rb"(user-content-fn(?:ref)?-[\w-]+?)-[0-9a-f]{6}\b"), rb"\1-ID"),
    # The GitHub star count is fetched at build time and stamped with the time.
    (re.compile(rb"stars:\d+,timestamp:0x[0-9a-f]+"), rb"stars:N,timestamp:T"),
    # react-hubspot-form numbers its containers in render order, which a
    # parallel build does not fix (reactHubspotForm0 on one, 3 on the other).
    (re.compile(rb"reactHubspotForm\d+"), rb"reactHubspotFormN"),
    # Netlify injects its Real User Metrics script after </body>.
    (re.compile(rb'<script async id="netlify-rum-container"[^>]*></script>\s*'), rb""),
    # scripts/html2md.py adds the pointer to a page's Markdown twin.
    (re.compile(rb'<link rel="alternate" type="text/markdown" href="[^"]*">'), rb""),
]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # the 3xx then surfaces as an HTTPError we can read


_OPENER = urllib.request.build_opener(NoRedirect())


def quote(path):
    """Percent-encode what urllib refuses to send, leaving a query intact."""
    return urllib.parse.quote(path, safe="/%?=&:@+,;~!*'()$#[]")


class Blocked(Exception):
    pass


class Pace:
    """A ceiling on requests per second to one origin, shared by every thread,
    and a tripwire for being cut off.

    The first full run of this script, at 8 threads and no pause, got the
    machine's address timed out by Netlify's edge for a while. Production is
    on the other end of every request here, so the default is slow."""

    def __init__(self, per_second):
        self.gap = 1.0 / per_second if per_second else 0.0
        self.lock = threading.Lock()
        self.next = 0.0
        self.dead = 0

    def wait(self):
        if self.dead >= 12:
            raise Blocked()
        if not self.gap:
            return
        with self.lock:
            now = time.monotonic()
            at = max(now, self.next)
            self.next = at + self.gap
        time.sleep(max(0.0, at - now))

    def saw(self, status):
        self.dead = self.dead + 1 if status == 0 else 0


PACES = {}


def fetch(origin, path, ua=CHROME, accept=None, tries=3, probe=False):
    """One request, redirects not followed.

    Returns a dict: status (0 if the request never completed), headers
    (lower-cased names), body (bytes), ttfb (seconds to the response headers).
    """
    headers = {"User-Agent": ua, "Accept": accept or "text/html,*/*;q=0.8"}
    if probe:
        # One byte of a large file: the 206 names the file's full length in
        # Content-Range, which a HEAD through the Worker does not.
        headers["Range"] = "bytes=0-0"
    req = urllib.request.Request(origin + quote(path), headers=headers)
    pace = PACES.get(origin)
    if pace:
        pace.wait()
    t0 = time.monotonic()
    try:
        try:
            r = _OPENER.open(req, timeout=TIMEOUT)
        except urllib.error.HTTPError as e:
            r = e
        ttfb = time.monotonic() - t0
        body = r.read()
        out = {"status": r.status if hasattr(r, "status") else r.code,
               "headers": {k.lower(): v for k, v in r.headers.items()},
               "body": body, "ttfb": ttfb}
        r.close()
    except (OSError, ValueError) as e:
        out = {"status": 0, "headers": {}, "body": b"", "ttfb": 0.0,
               "error": f"{type(e).__name__}: {e}"}
    if pace:
        pace.saw(out["status"])
    if out["status"] in TRANSIENT and tries > 1:
        time.sleep(2)
        return fetch(origin, path, ua, accept, tries - 1, probe)
    return out


# --------------------------------------------------------------------------
# normalising what is allowed to differ
# --------------------------------------------------------------------------
def host_of(origin):
    return urllib.parse.urlsplit(origin).netloc


def norm_ctype(v):
    return re.sub(r"\s+", "", (v or "").lower())


def norm_cache(v):
    return ",".join(sorted(p.strip() for p in (v or "").lower().split(",") if p.strip()))


class Sides:
    """The two origins, and how to make one's answers comparable to the other's."""

    def __init__(self, prod, test):
        self.prod, self.test = prod, test
        self.hosts = {host_of(prod)} | ({host_of(test)} if test else set())
        # The test host's own name, and its scheme when that is plain http
        # (wrangler dev), are the only differences a correct copy may show.
        self._subs = []
        if test and host_of(test) != host_of(prod):
            self._subs = [(test.encode(), prod.encode()),
                          (host_of(test).encode(), host_of(prod).encode())]

    def location(self, v):
        """A Location as path?query when it stays on either origin, else whole."""
        if not v:
            return ""
        u = urllib.parse.urlsplit(v)
        if not u.netloc or u.netloc in self.hosts:
            return (u.path or "/") + (("?" + u.query) if u.query else "") \
                + (("#" + u.fragment) if u.fragment else "")
        return v

    def body(self, raw, ctype):
        if self._subs and norm_ctype(ctype).startswith(TEXTUAL):
            for a, b in self._subs:
                raw = raw.replace(a, b)
        if norm_ctype(ctype).startswith("text/html"):
            for pattern, repl in BUILD_NOISE:
                raw = pattern.sub(repl, raw)
        return raw

    def record(self, resp, header_names):
        """What is compared, and what --save keeps, for one response."""
        h = resp["headers"]
        body = self.body(resp["body"], h.get("content-type"))
        return {
            "status": 200 if resp.get("probe") else resp["status"],
            "location": self.location(h.get("location")),
            "content-type": norm_ctype(h.get("content-type")),
            "cache-control": norm_cache(h.get("cache-control")),
            "headers": {n: (h.get(n) or "").strip() for n in header_names},
            "x-robots-tag": h.get("x-robots-tag", ""),
            # A one-byte probe: the file's full length stands in for its hash.
            "sha": hashlib.sha256(body).hexdigest() if not resp.get("probe")
            else "length:" + resp["probe"],
            "len": len(body) if not resp.get("probe") else int(resp["probe"]),
            "error": resp.get("error", ""),
        }


# --------------------------------------------------------------------------
# the URL set
# --------------------------------------------------------------------------
def generated():
    """worker/routes.generated.json, which `make cf` writes."""
    f = P("worker", "routes.generated.json")
    if not os.path.exists(f):
        sys.exit("parity: worker/routes.generated.json is missing; run `make cf` first")
    with open(f, encoding="utf-8") as fh:
        return json.load(fh)


def header_names():
    """Every header netlify.toml and static/_headers set, lower-cased.
    Content-Type and Cache-Control are compared on their own."""
    names = {n.lower() for block in generated()["headers"] for n, _ in block["headers"]}
    return sorted(names - {"cache-control", "content-type"})


def redirect_sources():
    """(source, is splat) for every rule that applies on the primary host.
    The docs.wasmcloud.com rules are compared by running this script against
    that host: --prod https://docs.wasmcloud.com --test https://docs-next.wasmcloud.com"""
    return [(r["from"], r["splat"]) for r in generated()["rules"] if "host" not in r]


def build_files(root):
    """Every file the Worker serves, as a URL path. The Markdown twins under
    _md/ are not addressable and are left out."""
    if not os.path.isdir(root):
        sys.exit(f"parity: no build at {root}; run `make cf` first")
    out = []
    for d, dirs, files in os.walk(root):
        if d == root:
            dirs[:] = [x for x in dirs if x != "_md"]
        for f in files:
            if f != ".DS_Store":
                out.append("/" + os.path.relpath(os.path.join(d, f), root).replace(os.sep, "/"))
    return sorted(out)


def sitemap_paths(origin):
    """Every same-host <loc> in every sitemap reachable from /sitemap.xml."""
    host, seen, pages, queue = host_of(origin), set(), [], ["/sitemap.xml"]
    newest = {}  # path -> lastmod, where the sitemap gives one
    while queue:
        sm = queue.pop(0)
        if sm in seen:
            continue
        seen.add(sm)
        r = fetch(origin, sm)
        if r["status"] != 200:
            print(f"  warning: sitemap {sm} answered HTTP {r['status']}", file=sys.stderr)
            continue
        xml = r["body"].decode("utf-8", "replace")
        xml = re.sub(r"<!--.*?-->", "", xml, flags=re.S)
        is_index = "<sitemapindex" in xml
        for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml):
            u = urllib.parse.urlsplit(loc.replace("&amp;", "&"))
            if u.netloc != host:
                continue
            path = (u.path or "/") + (("?" + u.query) if u.query else "")
            (queue if is_index else pages).append(path)
        for loc, mod in re.findall(
                r"<loc>\s*([^<\s]+)\s*</loc>\s*<lastmod>\s*([^<\s]+)", xml):
            newest[urllib.parse.urlsplit(loc).path] = mod
    return sorted(seen), pages, newest


def build_urls(args):
    """An ordered {path: source} and a few named picks for the special checks."""
    urls, counts = {}, {}

    def add(source, paths):
        n = 0
        for p in paths:
            if p not in urls:
                urls[p] = source
                n += 1
        counts[source] = counts.get(source, 0) + n

    files = build_files(args.build if os.path.isabs(args.build) else P(args.build))
    print("reading sitemaps from", args.prod)
    sitemaps, pages, lastmod = sitemap_paths(args.prod)
    docs = [p for p in pages if p.startswith("/docs/") and not p.startswith("/docs/v1/")
            and p != "/docs/"]
    blog = [p for p in pages if p.startswith("/blog/") and p.count("/") == 3
            and not p.startswith(("/blog/tags/", "/blog/page/", "/blog/authors/"))]
    community = [p for p in pages if p.startswith("/community/") and p.count("/") > 3]
    deep_doc = max(docs, key=lambda p: (p.count("/"), len(p)), default="/docs/")
    post = max(blog, key=lambda p: lastmod.get(p, ""), default="/blog/")
    meeting = max(community, key=lambda p: lastmod.get(p, ""), default="/community/")
    image = next((f for f in files if f.startswith("/logo/") and f.endswith(".png")),
                 "/logo/missing.png")

    fixed = ["/", "/docs/", "/docs/overview/", deep_doc, "/blog/", post, "/community/",
             meeting, "/llms.txt", "/llms-full.txt", "/robots.txt", "/sitemap.xml",
             "/favicon.ico", "/opensearch.xml", image,
             # Query strings, on a page and on a redirect (one with a fragment
             # in its target: the query goes ahead of it).
             "/?utm_source=parity", "/docs/overview/?utm_source=parity&x=1",
             "/install?utm_source=parity", "/docs/cli/app?x=1",
             # pretty_urls: an HTML page answers at its pretty URL and its file
             # name, and redirects from every other spelling that finds it.
             "/docs", "/docs/overview", "/docs/overview/index.html",
             "/docs/overview/index", "/docs/overview/index/",
             "/docs/overview/index.html/", "/index.html", "/index",
             "/404", "/404.html", "/404/", "/blog", "/community",
             # Netlify finds files case-insensitively and redirects a page
             # reached by the wrong case; its rules stay case-sensitive.
             "/INDEX.html", "/Docs/", "/Docs/Overview/", "/Docs/Overview",
             "/docs/overview/INDEX.html", "/Robots.TXT", "/LLMS.txt",
             "/Install", "/logo/WASMCLOUD-social.png",
             # Repeated and trailing slashes.
             "//docs//overview/", "//docs//overview", "//robots.txt", "//install",
             "/install/", "/install//", "/robots.txt/", "/sitemap.xml/",
             # The Netlify files themselves, and the Markdown twins' folder.
             "/_redirects", "/_headers", "/netlify.toml", "/_md/index.md",
             "/.well-known/security.txt"] + NOT_FOUND
    add("fixed", fixed)

    rule_paths = []
    for src, splat in redirect_sources():
        rule_paths.append(src)
        if src != "/":
            rule_paths.append(src.rstrip("/") + "/")
        if splat:
            # `/x/*` cannot be fetched; these stand for what it catches.
            base = src.rstrip("/") + "/"
            rule_paths += [base + "parity-probe", base + "parity-probe/deeper/"]
    add("rules", rule_paths)
    # Bundle file names carry a per-build hash, so the two builds do not share
    # them. Each side's bundles are reached through the pages that load them.
    add("build", [f for f in files
                  if not re.match(r"/assets/(js|css)/", f)])
    add("sitemaps", sitemaps + pages)

    if args.extra_urls:
        extra, hosts = [], {host_of(args.prod), "www." + host_of(args.prod)}
        with open(args.extra_urls, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip().split(",")[0].strip('"')
                if not line or line.startswith("#"):
                    continue
                u = urllib.parse.urlsplit(line)
                if u.netloc and u.netloc not in hosts:
                    continue
                if not (u.netloc or line.startswith("/")):
                    continue  # a CSV header row
                extra.append((u.path or "/") + (("?" + u.query) if u.query else ""))
        add("extra", extra)

    if args.limit and len(urls) > args.limit:
        # Keep the fixed list, then an even stride through the rest, so a
        # sample still touches rules, assets, docs and blog.
        keep = [p for p, s in urls.items() if s == "fixed"]
        rest = [p for p, s in urls.items() if s != "fixed"]
        step = max(1, len(rest) // max(1, args.limit - len(keep)))
        keep += rest[::step][:max(0, args.limit - len(keep))]
        urls = {p: urls[p] for p in keep}

    picks = {"pages": ["/", "/docs/overview/", deep_doc, post, meeting],
             "speed": ["/", "/docs/", "/docs/overview/", deep_doc, "/blog/", post,
                       "/community/", meeting, "/llms.txt", "/robots.txt",
                       "/sitemap.xml", image, "/install", "/docs", MISSING]}
    return urls, counts, picks


# --------------------------------------------------------------------------
# checks
# --------------------------------------------------------------------------
def diff_hint(a, b):
    """Where two bodies first part company, for the failure table."""
    n = next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))
    cut = lambda s: s[max(0, n - 30):n + 50].decode("utf-8", "replace").replace("\n", "⏎")
    return n, cut(a), cut(b)


def compare(path, p, t):
    """[(check, production value, test value)] for one URL's two records."""
    if p["status"] != t["status"]:
        note = lambda r: f"{r['status']}" + (f" → {r['location']}" if r["location"] else "") \
            + (f" ({r['error']})" if r["error"] else "")
        return [("status", note(p), note(t))]
    out = []
    if p["location"] != t["location"]:
        out.append(("location", p["location"], t["location"]))
    if p["cache-control"] != t["cache-control"]:
        out.append(("cache-control", p["cache-control"], t["cache-control"]))
    if p["status"] not in REDIRECTS:
        # Not on redirects: Netlify's edge attaches the _headers rules to a
        # 3xx on some requests and not others (a HEAD has them, the GET beside
        # it often does not), so production disagrees with itself there, and
        # no browser applies a framing or sniffing policy to a redirect.
        for name, v in p["headers"].items():
            if v != t["headers"].get(name, ""):
                out.append((f"header {name}", v, t["headers"].get(name, "")))
        # A redirect's body is boilerplate nobody reads, and its type with it.
        if p["content-type"] != t["content-type"]:
            out.append(("content-type", p["content-type"], t["content-type"]))
        if p["sha"] != t["sha"]:
            check = "404 body" if p["status"] == 404 else "body"
            out.append((check, f"sha {p['sha'][:12]} ({p['len']} B)",
                        f"sha {t['sha'][:12]} ({t['len']} B)"))
    return out


def sweep(urls, sides, header_names, workers, baseline=None, full=False):
    """Fetch every URL on both sides. Returns (prod records, test records, failures)."""
    prod_recs, test_recs, failures = {}, {}, []

    def get(origin, path):
        if full or not path.split("?")[0].lower().endswith(BINARY):
            return fetch(origin, path)
        r = fetch(origin, path, probe=True)
        m = re.match(r"bytes 0-0/(\d+)$", r["headers"].get("content-range", ""))
        if r["status"] == 206 and m:
            r["probe"] = m.group(1)
            return r
        return fetch(origin, path)  # no range support here: compare it whole

    def one(path):
        def pair():
            if baseline is not None:
                p = baseline.get(path)
                t = sides.record(get(sides.prod, path), header_names)
                return p, t, None, None
            rp, rt = get(sides.prod, path), get(sides.test, path)
            return sides.record(rp, header_names), sides.record(rt, header_names), rp, rt

        p, t, rp, rt = pair()
        if p is None:
            return path, None, t, []
        diffs = compare(path, p, t)
        if diffs:
            # docs and blog are other deploys and can publish mid-run; a
            # mismatch has to survive a second look at both sides.
            time.sleep(1)
            p, t, rp, rt = pair()
            diffs = compare(path, p, t)
        if rp and any(c in ("body", "404 body") for c, _, _ in diffs) \
                and p["content-type"].startswith(TEXTUAL):
            a = sides.body(rp["body"], p["content-type"])
            b = sides.body(rt["body"], t["content-type"])
            n, x, y = diff_hint(a, b)
            diffs = [(c, f"{pv}; at byte {n}: `{x}`", f"{tv}; at byte {n}: `{y}`")
                     if c in ("body", "404 body") else (c, pv, tv) for c, pv, tv in diffs]
        return path, p, t, diffs

    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for path, p, t, diffs in pool.map(one, list(urls)):
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(urls)}", flush=True)
            if p is not None:
                prod_recs[path] = p
            test_recs[path] = t
            failures += [(path, c, pv, tv) for c, pv, tv in diffs]
    return prod_recs, test_recs, failures


def check_not_found(prod_recs, test_recs):
    """A missing path answers 404 with the same page on both sides."""
    out = []
    for path in NOT_FOUND:
        p, t = prod_recs.get(path), test_recs.get(path)
        if p and t and p["status"] == t["status"] == 200:
            out.append((path, "404 handling", "200", "200 (expected 404 on both)"))
        elif p and t and p["status"] == 404 and t["status"] == 404 \
                and "text/html" not in t["content-type"]:
            out.append((path, "404 handling", p["content-type"], t["content-type"]))
    return out


def check_agents(origin, pages, real_md=()):
    """AI agents get Markdown, with the headers that keep caches and canonicals honest."""
    out, n = [], 0
    variants = [(f"UA {k}", v, None) for k, v in AI_AGENTS.items()]
    variants.append(("Accept: text/markdown", CHROME, "text/markdown"))
    for path in pages:
        html = fetch(origin, path)
        want_cache = norm_cache(html["headers"].get("cache-control"))
        canonical = CANONICAL_ORIGIN + path
        for label, ua, accept in variants:
            n += 1
            r = fetch(origin, path, ua=ua, accept=accept)
            h, bad = r["headers"], []
            if r["status"] != 200:
                bad.append(f"HTTP {r['status']}")
            if not norm_ctype(h.get("content-type")).startswith("text/markdown"):
                bad.append(f"Content-Type {h.get('content-type')!r}")
            vary = {v.strip().lower() for v in h.get("vary", "").split(",")}
            if not {"accept", "user-agent"} <= vary:
                bad.append(f"Vary {h.get('vary', '')!r}")
            link = h.get("link", "")
            if f"<{canonical}>" not in link or "canonical" not in link:
                bad.append(f"Link {link!r}")
            if norm_cache(h.get("cache-control")) != want_cache:
                bad.append(f"Cache-Control {h.get('cache-control')!r} (HTML has {want_cache!r})")
            if r["status"] == 200 and r["body"].lstrip()[:15].lower().startswith(
                    (b"<!doctype", b"<html")):
                bad.append("body is HTML")
            if not h.get("content-signal"):
                bad.append("no Content-Signal")
            if not h.get("x-markdown-tokens", "").isdigit():
                bad.append(f"x-markdown-tokens {h.get('x-markdown-tokens', '')!r}")
            if bad:
                out.append((path, f"AI agent ({label})",
                            f"text/markdown; Vary: Accept, User-Agent; "
                            f"Link: <{canonical}>; rel=\"canonical\"", "; ".join(bad)))

        # The HTML advertises its Markdown (RFC 8288), and that URL answers.
        n += 1
        link = html["headers"].get("link", "")
        m = re.search(r'<([^>]+)>\s*;[^,]*rel="alternate"[^,]*type="text/markdown"', link)
        if not m:
            out.append((path, "AI agent (alternate Link)",
                        'Link: <.../index.md>; rel="alternate"; type="text/markdown"',
                        f"Link {link!r}"))
        md_paths = {md_variant(path, True), md_variant(path, False)}
        if m:
            md_paths.add(urllib.parse.urlsplit(m.group(1)).path)
        # A .md URL is a second address for the page: same Markdown, pointing
        # back at the HTML as canonical, and never indexed itself.
        for md in sorted(md_paths):
            n += 1
            r = fetch(origin, md)
            h, bad = r["headers"], []
            if r["status"] != 200:
                bad.append(f"HTTP {r['status']}")
            if not norm_ctype(h.get("content-type")).startswith("text/markdown"):
                bad.append(f"Content-Type {h.get('content-type')!r}")
            if md in real_md:
                # A .md file docusaurus-plugin-llms wrote into the build. It
                # is served as the file it is; only its type is the Worker's.
                if bad:
                    out.append((md, "AI agent (.md file)", "200 text/markdown", "; ".join(bad)))
                continue
            link = h.get("link", "")
            if f"<{canonical}>" not in link or "canonical" not in link:
                bad.append(f"Link {link!r}")
            if "noindex" not in h.get("x-robots-tag", "").lower():
                bad.append(f"X-Robots-Tag {h.get('x-robots-tag', '')!r}")
            if not h.get("content-signal"):
                bad.append("no Content-Signal")
            if bad:
                out.append((md, "AI agent (.md URL)",
                            f"text/markdown; noindex; Link: <{canonical}>; rel=\"canonical\"",
                            "; ".join(bad)))
    return out, n


def md_variant(path, index):
    """The two spellings of a page's .md URL: /a/index.md and /a.md."""
    d = path if path.endswith("/") else path + "/"
    if index or d == "/":
        return d + "index.md"
    return d[:-1] + ".md"


def check_crawlers(origin, pages):
    """Search crawlers get the bytes a person gets. Anything else is cloaking."""
    out, n = [], 0
    for path in pages:
        human = fetch(origin, path)
        for name, ua in CRAWLERS.items():
            n += 1
            r = fetch(origin, path, ua=ua)
            ct = norm_ctype(r["headers"].get("content-type"))
            if not ct.startswith("text/html"):
                out.append((path, f"search crawler ({name})", "text/html", ct))
            elif r["body"] != human["body"] or r["status"] != human["status"]:
                out.append((path, f"search crawler ({name})",
                            f"Chrome: {human['status']}, sha "
                            f"{hashlib.sha256(human['body']).hexdigest()[:12]}",
                            f"{name}: {r['status']}, sha "
                            f"{hashlib.sha256(r['body']).hexdigest()[:12]}"))
    return out, n


def check_noindex(prod_recs, test_recs, test_must_have):
    """The copy must never be indexed; production must never be told not to be."""
    out = []
    for path, t in test_recs.items():
        has = "noindex" in t["x-robots-tag"].lower()
        if has != test_must_have and t["status"]:
            out.append((path, "noindex",
                        "" if path not in prod_recs else prod_recs[path]["x-robots-tag"],
                        t["x-robots-tag"] or "(no X-Robots-Tag)"))
    if test_must_have:
        for path, p in prod_recs.items():
            if "noindex" in p["x-robots-tag"].lower():
                out.append((path, "noindex on production", p["x-robots-tag"], ""))
    return out


def measure_ttfb(origin, paths, rounds=3):
    times = []
    for _ in range(rounds):
        for path in paths:
            r = fetch(origin, path, tries=1)
            if r["status"]:
                times.append(r["ttfb"])
    return statistics.median(times) * 1000 if times else float("nan")


# --------------------------------------------------------------------------
# explained differences
# --------------------------------------------------------------------------
def load_allow():
    """scripts/parity-allow.txt: `<check glob> | <path glob> | <reason>` per line."""
    rules, f = [], P("scripts", "parity-allow.txt")
    if os.path.exists(f):
        with open(f, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = [x.strip() for x in line.split("|", 2)]
                if len(parts) != 3 or not all(parts):
                    sys.exit(f"parity: bad line in parity-allow.txt: {line!r}")
                rules.append(tuple(parts))
    return rules


def split_explained(failures, allow):
    real, explained = [], {}
    for f in failures:
        path, check = f[0], f[1]
        rule = next((r for r in allow if fnmatch.fnmatchcase(check, r[0])
                     and fnmatch.fnmatchcase(path, r[1])), None)
        if rule:
            explained.setdefault(rule, []).append(f)
        else:
            real.append(f)
    return real, explained


# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------
def cell(v):
    v = str(v).replace("|", "\\|").replace("\n", " ")
    return v if len(v) <= 220 else v[:217] + "..."


def write_report(args, ctx):
    real, explained = ctx["real"], ctx["explained"]
    L = []
    w = L.append
    w("# Parity report: wasmcloud.com")
    w("")
    w(f"- Production: `{ctx['left']}`")
    w(f"- Test: `{ctx['right']}`")
    w(f"- Run: {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    w(f"- Result: **{'PASS' if not real else 'FAIL'}**: {ctx['n_urls']} URLs, "
      f"{len(real)} unexplained difference{'s' if len(real) != 1 else ''}, "
      f"{sum(len(v) for v in explained.values())} explained")
    w("")
    w("## URL set")
    w("")
    w("| Source | URLs (after dedupe) |")
    w("|---|---|")
    for k, v in ctx["counts"].items():
        w(f"| {k} | {v} |")
    w(f"| **compared** | **{ctx['n_urls']}**{' (`--limit`)' if args.limit else ''} |")
    w("")
    w("## Checks")
    w("")
    w("| Check | Checked | Failed | Result |")
    w("|---|---|---|---|")
    for name, checked, failed, note in ctx["summary"]:
        res = note or ("pass" if not failed else "**FAIL**")
        w(f"| {name} | {checked} | {failed} | {res} |")
    w("| Visual check | manual | - | compare `/`, one docs page, one blog post, one "
      "community page and the 404 page on both hosts |")
    w("")
    w("## Failures")
    w("")
    if not real:
        w("None.")
    else:
        w("| URL | Check | Production | Test |")
        w("|---|---|---|---|")
        shown = {}
        for path, check, pv, tv in real:
            group = check.split(" (")[0]
            shown[group] = shown.get(group, 0) + 1
            if shown[group] <= ROWS_PER_CHECK:
                w(f"| `{cell(path)}` | {cell(check)} | {cell(pv)} | {cell(tv)} |")
        for group, n in shown.items():
            if n > ROWS_PER_CHECK:
                w(f"| ... | {group} | {n - ROWS_PER_CHECK} more not shown | |")
    w("")
    if explained:
        w("## Explained differences")
        w("")
        w("From `scripts/parity-allow.txt`. These do not fail the run.")
        w("")
        w("| Check | Path pattern | URLs | Reason | Example |")
        w("|---|---|---|---|---|")
        for (check, pat, reason), fs in explained.items():
            ex = fs[0]
            w(f"| {cell(check)} | `{cell(pat)}` | {len(fs)} | {cell(reason)} | "
              f"`{cell(ex[0])}`: {cell(ex[2])} vs {cell(ex[3])} |")
        w("")
    w("## Rerun")
    w("")
    w("```bash")
    w("cd cloudflare")
    w("python3 scripts/parity.py " + shlex.join(sys.argv[1:]))
    w("```")
    w("")
    out = args.report if os.path.isabs(args.report) else P(args.report)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))
    return out


# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--prod", default="https://wasmcloud.com")
    ap.add_argument("--test", default="https://next.wasmcloud.com",
                    help="origin to compare with production")
    ap.add_argument("--extra-urls", metavar="FILE",
                    help="more URLs or paths, one per line (a CSV's first column works)")
    ap.add_argument("--build", default="build/assets",
                    help="the asset tree `make cf` built (default build/assets)")
    ap.add_argument("--report", default="build/parity-report.md")
    ap.add_argument("--save", metavar="FILE", help="write production's answers as JSON")
    ap.add_argument("--baseline", metavar="FILE",
                    help="compare live --prod against a --save file instead of --test")
    ap.add_argument("--limit", type=int, default=0, help="sample this many URLs")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--rate", type=float, default=5.0,
                    help="most requests per second to each origin (default 5; 0 for no limit)")
    ap.add_argument("--full-bodies", action="store_true",
                    help="download images, PDFs and fonts too, instead of comparing "
                         "their status, type and length from a one-byte range request")
    ap.add_argument("--failures", metavar="FILE",
                    help="also write every difference, explained or not, as JSON")
    ap.add_argument("--skip-test-host-checks", action="store_true",
                    help="skip the Markdown, crawler, noindex and speed checks "
                         "(for comparing two hosts that are both Netlify)")
    args = ap.parse_args()
    args.prod, args.test = args.prod.rstrip("/"), args.test.rstrip("/")
    args.workers = max(1, min(args.workers, 8))  # production is on the other end

    names = header_names()
    allow = load_allow()
    baseline = None

    if args.baseline:
        with open(args.baseline, encoding="utf-8") as fh:
            saved = json.load(fh)
        baseline = saved["records"]
        sides = Sides(args.prod, None)
        urls = {p: "baseline" for p in baseline}
        if args.limit:
            urls = dict(list(urls.items())[:args.limit])
        counts, picks = {"baseline": len(baseline)}, saved["picks"]
        left = f"{saved['origin']} as saved {saved['saved_at']} ({args.baseline})"
        right, live = args.prod, args.prod
    else:
        sides = Sides(args.prod, args.test)
        urls, counts, picks = build_urls(args)
        left, right, live = args.prod, args.test, args.test

    for origin in {args.prod, args.test}:
        PACES[origin] = Pace(args.rate)
    for origin in {args.prod, live}:
        r = fetch(origin, "/")
        if r["status"] == 0:
            sys.exit(f"parity: cannot reach {origin}: {r.get('error')}")

    print(f"comparing {len(urls)} URLs: {left}  vs  {right}")
    try:
        prod_recs, test_recs, failures = sweep(urls, sides, names, args.workers, baseline,
                                               args.full_bodies)
    except Blocked:
        sys.exit("parity: twelve requests in a row never completed. The origin has "
                 "probably stopped answering this address; stop, wait, and rerun "
                 "with a lower --rate.")
    failures += check_not_found(prod_recs, test_recs)

    def count(*names):
        return sum(1 for f in failures if f[1].split(" (")[0].startswith(names))

    n = len(urls)
    summary = [
        ("Status codes", n, count("status"), ""),
        ("Redirect targets", sum(1 for r in prod_recs.values() if r["status"] in REDIRECTS),
         count("location"), ""),
        ("Content-Type", n, count("content-type"), ""),
        ("Cache-Control", n, count("cache-control"), ""),
        ("Page content (body hash)", n, count("body"), ""),
        (f"Custom headers ({', '.join(names)})",
         sum(1 for r in prod_recs.values() if r["status"] not in REDIRECTS),
         count("header "), ""),
        ("404 handling", len([p for p in NOT_FOUND if p in urls]),
         count("404 handling", "404 body"), ""),
    ]

    if args.skip_test_host_checks:
        for name in ("AI agent branch", "Search crawlers", "Test host hygiene", "Speed"):
            summary.append((name, 0, 0, "skipped (`--skip-test-host-checks`)"))
    else:
        print("checking the AI agent and crawler branches on", live)
        root = args.build if os.path.isabs(args.build) else P(args.build)
        real_md = {f for f in build_files(root) if f.endswith(".md")} if os.path.isdir(root) else set()
        fa, na = check_agents(live, picks["pages"], real_md)
        fc, nc = check_crawlers(live, picks["pages"])
        # After cutover the Worker serves production, where noindex would be
        # the bug; before it, the copy must carry it on everything.
        fn = check_noindex(prod_recs if not baseline else {}, test_recs,
                           test_must_have=not baseline)
        failures += fa + fc + fn
        summary += [("AI agent branch", na, len(fa), ""),
                    ("Search crawlers", nc, len(fc), ""),
                    ("Test host hygiene (noindex)" if not baseline
                     else "No noindex on production", len(test_recs), len(fn), "")]
        print("measuring time to first byte")
        t_ms = measure_ttfb(live, picks["speed"])
        p_ms = saved["ttfb_ms"] if baseline else measure_ttfb(args.prod, picks["speed"])
        note = f"production {p_ms:.0f} ms, test {t_ms:.0f} ms (median)"
        if t_ms > p_ms * 1.10:
            failures.append(("(15 sampled URLs x 3)", "speed", f"{p_ms:.0f} ms", f"{t_ms:.0f} ms"))
            summary.append(("Speed", len(picks["speed"]) * 3, 1, "**FAIL**: " + note))
        elif t_ms > p_ms:
            summary.append(("Speed", len(picks["speed"]) * 3, 0,
                            "pass (informational: within 10%): " + note))
        else:
            summary.append(("Speed", len(picks["speed"]) * 3, 0, "pass: " + note))

    if args.save and not baseline:
        out = args.save if os.path.isabs(args.save) else P(args.save)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as fh:
            json.dump({"origin": args.prod,
                       "saved_at": datetime.datetime.now(datetime.timezone.utc)
                       .strftime("%Y-%m-%d %H:%M UTC"),
                       "ttfb_ms": measure_ttfb(args.prod, picks["speed"]),
                       "picks": picks, "records": prod_recs}, fh, indent=1)
        print("saved production's answers to", out)

    real, explained = split_explained(failures, allow)
    if args.failures:
        with open(args.failures, "w", encoding="utf-8") as fh:
            json.dump(failures, fh, indent=1)
    report = write_report(args, {
        "left": left, "right": right, "counts": counts, "n_urls": n,
        "summary": summary, "real": real, "explained": explained})

    print(f"\nreport: {report}")
    n_exp = sum(len(v) for v in explained.values())
    if real:
        print(f"parity: FAILED, {len(real)} unexplained difference(s) "
              f"({n_exp} explained)", file=sys.stderr)
        for path, check, pv, tv in real[:25]:
            print(f"  {path}: {check}: {pv!s:.90}  !=  {tv!s:.90}", file=sys.stderr)
        if len(real) > 25:
            print(f"  ... and {len(real) - 25} more, see the report", file=sys.stderr)
        sys.exit(1)
    print(f"parity: {n} URLs match ({n_exp} explained difference(s))")


if __name__ == "__main__":
    main()
