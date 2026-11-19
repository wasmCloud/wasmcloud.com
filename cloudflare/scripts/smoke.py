"""Check a deployed copy of wasmcloud.com serves what its rules say.

parity.py asks "does this deploy answer exactly like that one"; this asks the
smaller question that still has an answer when there is nothing to compare
with: does this deploy do what netlify.toml says, right now. CI runs it after
every deploy.

It reads worker/routes.generated.json (so run `make cf` first) and asserts:

  pages       a handful of real pages answer 200 as themselves, checked
              against their own canonical URL
  redirects   every rule that applies on this host answers its status and its
              Location, and a local target lands on a 200 without looping
  not found   a missing path answers 404 with the HTML not-found page
  headers     every header the `/*` blocks set is on a page
  Markdown    a page answers text/markdown when asked for it, and its HTML
              names the Markdown in a Link header and a <link> tag
  indexing    X-Robots-Tag: noindex on a test hostname, and never on
              wasmcloud.com

    python3 scripts/smoke.py https://next.wasmcloud.com
    python3 scripts/smoke.py https://wasmcloud.com

Exits non-zero listing every failure.
"""
import concurrent.futures
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *parts: os.path.join(_ROOT, *parts)

UA = "wasmcloud-www-smoke/1"
TIMEOUT = 30
REDIRECTS = (301, 302, 303, 307, 308)
PRODUCTION = "wasmcloud.com"
PAGES = ["/", "/docs/", "/docs/overview/", "/docs/installation/", "/blog/", "/community/"]
FILES = ["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/favicon.ico"]
MISSING = "/smoke-probe-missing-page/"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_OPENER = urllib.request.build_opener(NoRedirect())


def fetch(url, accept=None, tries=3):
    """One GET, redirects not followed: (status, headers, body)."""
    headers = {"User-Agent": UA, "Accept": accept or "text/html,*/*;q=0.8"}
    req = urllib.request.Request(urllib.parse.quote(url, safe="/%?=&:@+,;~!*'()$#[]"),
                                 headers=headers)
    try:
        try:
            r = _OPENER.open(req, timeout=TIMEOUT)
        except urllib.error.HTTPError as e:
            r = e
        out = (r.status if hasattr(r, "status") else r.code,
               {k.lower(): v for k, v in r.headers.items()}, r.read())
        r.close()
    except (OSError, ValueError) as e:
        out = (0, {"x-error": f"{type(e).__name__}: {e}"}, b"")
    # A newly attached hostname answers 522 on some requests for a minute or
    # two; a retry is the difference between that and a real failure.
    if out[0] in (0, 502, 503, 504, 522) and tries > 1:
        time.sleep(2)
        return fetch(url, accept, tries - 1)
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    base = (args[0] if args else "https://next.wasmcloud.com").rstrip("/")
    host = urllib.parse.urlsplit(base).netloc.lower()
    with open(P("worker", "routes.generated.json"), encoding="utf-8") as fh:
        table = json.load(fh)
    failures = []
    fail = lambda url, why: failures.append(f"{url}: {why}")

    # -- pages and files ----------------------------------------------------
    for path in PAGES:
        status, h, body = fetch(base + path)
        if status != 200 or "text/html" not in h.get("content-type", ""):
            fail(path, f"expected 200 text/html, got {status} {h.get('content-type')}")
            continue
        m = re.search(rb'<link[^>]*rel="?canonical"?[^>]*href="?([^"\s>]+)', body)
        want = f"https://{PRODUCTION}{path}"
        if not m or m.group(1).decode() != want:
            fail(path, f"canonical is {m.group(1).decode() if m else None!r}, expected {want!r}")
    for path in FILES:
        status, h, body = fetch(base + path)
        if status != 200 or not body:
            fail(path, f"expected 200 with a body, got {status}")
    print(f"pages and files: {len(PAGES) + len(FILES)} checked")

    # -- redirects ----------------------------------------------------------
    rules = [r for r in table["rules"] if "host" not in r]
    landed = {}

    def check_rule(r):
        src = r["from"].rstrip("/") + "/smoke-probe" if r["splat"] else r["from"]
        want = r["to"].replace(":splat", "smoke-probe")
        status, h, _ = fetch(base + src)
        loc = h.get("location", "")
        # An unforced rule does not exist where a file does: /docs and
        # /innovation-day are pages, so they answer 200 at their own URL and
        # 301 to it from the spelling without a slash.
        if not r["force"] and (status == 200 or (
                status == 301 and loc == src.rstrip("/") + "/" and loc != want)):
            return None
        if status != r["status"]:
            return f"{src}: expected {r['status']}, got {status}"
        whole = lambda u: urllib.parse.urlsplit(urllib.parse.urljoin(base + src, u))._replace(
            path=urllib.parse.urlsplit(urllib.parse.urljoin(base + src, u)).path or "/").geturl()
        if whole(loc) != whole(want):
            return f"{src}: Location is {loc!r}, expected {want!r}"
        if want.startswith("/") and not r["splat"]:
            target = want.split("#")[0]
            if target.rstrip("/") == src.rstrip("/"):
                return f"{src}: redirects to itself"
            if target not in landed:
                s2, h2, _ = fetch(base + target)
                # one more hop is fine (a rule pointing at another rule, or at
                # a page's non-pretty spelling); it has to end on a page.
                if s2 in REDIRECTS:
                    s2, h2, _ = fetch(urllib.parse.urljoin(base + target, h2.get("location", "")))
                landed[target] = s2
            if landed[target] != 200:
                return f"{src}: target {target} answers {landed[target]}, expected 200"
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for err in pool.map(check_rule, rules):
            if err:
                failures.append(err)
    print(f"redirects: {len(rules)} rules checked")

    # -- not found ----------------------------------------------------------
    status, h, body = fetch(base + MISSING)
    if status != 404 or "text/html" not in h.get("content-type", ""):
        fail(MISSING, f"expected 404 text/html, got {status} {h.get('content-type')}")

    # -- headers ------------------------------------------------------------
    status, h, body = fetch(base + "/docs/overview/")
    for block in table["headers"]:
        if block.get("from") == "/" and block.get("splat"):
            for name, value in block["headers"]:
                if h.get(name.lower(), "").strip() != value:
                    fail("/docs/overview/", f"header {name} is {h.get(name.lower())!r}")

    # -- Markdown -----------------------------------------------------------
    page = "/docs/overview/"
    link = h.get("link", "")
    if 'rel="alternate"' not in link or "text/markdown" not in link:
        fail(page, f"no Link rel=alternate header for Markdown: {link!r}")
    if b'rel="alternate" type="text/markdown"' not in body:
        fail(page, 'no <link rel="alternate" type="text/markdown"> tag in the HTML')
    for label, url, accept in (("Accept: text/markdown", page, "text/markdown"),
                               (".md URL", "/docs/overview.md", None),
                               ("index.md URL", "/blog/index.md", None)):
        s, mh, mb = fetch(base + url, accept=accept)
        if s != 200 or not mh.get("content-type", "").startswith("text/markdown") \
                or mb.lstrip()[:9].lower() in (b"<!doctype", b"<html lan"):
            fail(url, f"{label}: expected 200 text/markdown, got {s} {mh.get('content-type')}")
    s, gh, gb = fetch(base + page, accept=None)
    if b"<html" not in gb[:2000].lower():
        fail(page, "a browser request did not get HTML")
    print("not found, headers and Markdown: checked")

    # -- indexing -----------------------------------------------------------
    noindex = "noindex" in h.get("x-robots-tag", "").lower()
    if host in (PRODUCTION, "www." + PRODUCTION) and noindex:
        fail(page, "production carries X-Robots-Tag: noindex")
    if host not in (PRODUCTION, "www." + PRODUCTION) and not noindex:
        fail(page, "a test host is missing X-Robots-Tag: noindex")

    if failures:
        print(f"\nsmoke: {len(failures)} failure(s) on {base}", file=sys.stderr)
        for f in failures:
            print("  " + f, file=sys.stderr)
        sys.exit(1)
    print(f"smoke: {base} OK")


if __name__ == "__main__":
    main()
