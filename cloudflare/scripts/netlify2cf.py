"""Translate the Netlify routing rules into the Cloudflare Worker's table.

`netlify.toml` (its `redirects` array and `[[headers]]` blocks) and
`static/_headers` stay the single source of truth for routing: Netlify reads
them directly, and this turns the same files into
cloudflare/worker/routes.generated.json, which worker/src/index.js imports.
Edit the Netlify files, never the JSON; `make cf` reruns this.

Why a table in the Worker and not a Cloudflare `_redirects` file: the two
formats share a name and little else. The rules here use the force flag, rules
scoped to one hostname (docs.wasmcloud.com), unforced rules that yield to a
file (/docs is a page, although a rule names it), and /x and /x/ matching
interchangeably. Cloudflare's file has none of those, and its `_headers` file
does not reach Worker-generated responses.

This script refuses anything it cannot place. A rule that is silently dropped
is a URL that silently changes behaviour at cutover, so every unsupported
construct exits non-zero and names the rule.

    python3 scripts/netlify2cf.py --check        # parse and summarise, write nothing
    python3 scripts/netlify2cf.py --assets DIR   # write worker/routes.generated.json,
                                                 # with DIR's files and Markdown twins

Needs Python 3.11 or later (tomllib).
"""
import json
import os
import re
import sys

try:
    import tomllib
except ModuleNotFoundError:
    sys.exit("netlify2cf: needs Python 3.11 or later (tomllib). "
             "Run it with a newer interpreter: make cf PYTHON=python3.12")

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # cloudflare/
_REPO = os.path.dirname(_ROOT)
P = lambda *parts: os.path.join(_ROOT, *parts)

OUT = P("worker", "routes.generated.json")
NETLIFY_TOML = os.path.join(_REPO, "netlify.toml")
HEADERS_FILE = os.path.join(_REPO, "static", "_headers")

# The hostname the site lives on, and the other hostnames attached to the same
# Netlify site. A rule may be scoped to one of them; `www` is not here because
# Netlify redirects it to the primary domain before any rule runs.
PRIMARY = "wasmcloud.com"
HOSTS = ["wasmcloud.com", "docs.wasmcloud.com"]

# What the Worker's engine implements. 200 rewrites, 404 rules and anything
# else Netlify accepts would need code there first; none are in use.
STATUSES = {301, 302, 303, 307, 308}
RULE_KEYS = {"from", "to", "status", "force"}
# Top-level netlify.toml tables this script knows are irrelevant to routing.
# Anything else is refused, so a new [[edge_functions]] or [[plugins]] block
# cannot slip past unnoticed.
KNOWN_TOP = {"redirects", "headers", "build"}
# build.processing.html.pretty_urls is implemented by the Worker (see
# serveLocal in worker/src/index.js); it must be on.
KNOWN_BUILD = {"processing"}


class Unplaceable(Exception):
    pass


def die(where, why):
    raise Unplaceable(f"{where}: {why}")


def parse_redirects(doc):
    rules = []
    for n, r in enumerate(doc.get("redirects", []), 1):
        where = f"netlify.toml redirect #{n} ({r.get('from')!r})"
        extra = set(r) - RULE_KEYS
        if extra:
            die(where, f"unsupported keys {sorted(extra)} (conditions, query, "
                "headers and signed rules are not implemented)")
        if "from" not in r or "to" not in r:
            die(where, "needs both `from` and `to`")
        src, dst = r["from"], r["to"]
        status = r.get("status", 301)
        force = bool(r.get("force", False))
        if status not in STATUSES:
            die(where, f"status {status} is not supported "
                f"(supported: {sorted(STATUSES)})")

        # A source may be scoped to one hostname. Such a rule only fires for
        # requests to that host; on any other host it does not exist.
        host = None
        m = re.match(r"(https?)://([^/]+)(/.*)?$", src)
        if m:
            scheme, host, src = m.group(1), m.group(2).lower(), m.group(3) or "/"
            if host not in HOSTS:
                die(where, f"source is scoped to {host!r}, which is not one "
                    f"of this site's hosts {HOSTS}")
            if scheme == "http":
                # Netlify sends plain http to https on the same host before
                # any rule runs (checked on production: http://docs.wasmcloud.com/x
                # answers 301 to https://docs.wasmcloud.com/x), so an http://
                # rule never fires. It is accepted and left out of the table.
                continue
        if not src.startswith("/"):
            die(where, "source is neither a path nor an absolute URL")
        if not dst.startswith(("/", "https://")):
            die(where, f"target {dst!r} is neither a path nor an https URL")

        splat = src.endswith("/*")
        stem = src[:-2] if splat else src
        if "*" in stem:
            die(where, "a splat is only supported as a trailing /*")
        if re.search(r"/:[A-Za-z_]", src):
            die(where, "named placeholders in the source are not supported")
        if "?" in src:
            die(where, "query string in the source is not supported")
        placeholders = set(re.findall(r":([A-Za-z_]\w*)", re.sub(r"^https://", "", dst)))
        if placeholders - {"splat"}:
            die(where, "only the :splat placeholder is supported, found "
                f"{sorted(placeholders - {'splat'})}")
        if ":splat" in dst and not splat:
            die(where, ":splat in the target without a /* in the source")

        rules.append({
            "n": n,
            **({"host": host} if host else {}),
            "from": (stem if splat else src) or "/",
            "splat": splat,
            "to": dst,
            "status": status,
            "force": force,
        })
    return rules


def pattern(where, text):
    """One header pattern as {from, splat} or {glob}. A trailing /* is a
    prefix match; a * anywhere else is turned into a regular expression, where
    * and ** both match any run of characters, slashes included, as Netlify's
    do (production serves /docs/a/b/c.md under `/docs/*.md`)."""
    if not text.startswith("/"):
        die(where, f"header pattern {text!r} is not a path")
    if re.search(r"/:[A-Za-z_]", text):
        die(where, "named placeholders in header patterns are not supported")
    splat = text.endswith("/*")
    stem = text[:-2] if splat else text
    if "*" not in stem:
        return {"from": stem or "/", "splat": splat}
    regex = "^" + ".*".join(re.escape(part) for part in re.split(r"\*+", text)) + "$"
    return {"glob": regex}


def check_header(where, name, value):
    if not re.fullmatch(r"[A-Za-z0-9-]+", name) or not isinstance(value, str) or not value.strip():
        die(where, f"malformed header {name!r}")
    # A TOML multi-line string leaves runs of spaces where the lines joined;
    # Netlify sends them collapsed.
    return [name, re.sub(r"\s+", " ", value).strip()]


def parse_headers_file(path):
    """static/_headers, in Netlify's own format."""
    blocks, current = [], None
    rel = os.path.relpath(path, _REPO)
    with open(path, encoding="utf-8") as fh:
        for lineno, raw in enumerate(fh, 1):
            where = f"{rel}:{lineno}"
            stripped = raw.strip()
            if not stripped or stripped.startswith("#"):
                continue
            if not raw[0].isspace():
                current = {**pattern(where, stripped), "src": where, "headers": []}
                blocks.append(current)
                continue
            if current is None:
                die(where, "header line before any path pattern")
            if ":" not in stripped:
                die(where, "expected `Name: value`")
            name, value = stripped.split(":", 1)
            if name.strip().startswith("!"):
                die(where, "header removal (`! Name`) is not supported")
            current["headers"].append(check_header(where, name.strip(), value))
    for b in blocks:
        if not b["headers"]:
            die(b["src"], "header block has no headers")
    return blocks


def parse_headers_toml(doc):
    blocks = []
    for n, h in enumerate(doc.get("headers", []), 1):
        where = f"netlify.toml [[headers]] #{n} ({h.get('for')!r})"
        if set(h) - {"for", "values"}:
            die(where, f"unsupported keys {sorted(set(h) - {'for', 'values'})}")
        if not h.get("values"):
            die(where, "header block has no values")
        blocks.append({**pattern(where, h["for"]), "src": where,
                       "headers": [check_header(where, k, v) for k, v in h["values"].items()]})
    return blocks


def check_rest(doc):
    extra = set(doc) - KNOWN_TOP
    if extra:
        die("netlify.toml", f"sections {sorted(extra)} are not handled by the "
            "Cloudflare Worker; decide what each should become there first")
    build = doc.get("build", {})
    if set(build) - KNOWN_BUILD:
        die("netlify.toml [build]", f"keys {sorted(set(build) - KNOWN_BUILD)} "
            "are not known to the Cloudflare build")
    html = build.get("processing", {}).get("html", {})
    if html.get("pretty_urls") is not True:
        die("netlify.toml [build.processing.html]", "the Worker reproduces "
            "pretty_urls = true; it does not implement the setting being off")


def markdown_twins(assets):
    """Asset paths of the HTML pages scripts/html2md.py wrote a Markdown twin
    for: /_md/docs/faq/index.md stands for /docs/faq/index.html. The Worker
    uses the list to advertise the Markdown version of a page without asking
    the asset binding whether one exists."""
    root = os.path.join(assets, "_md") if assets else ""
    if not os.path.isdir(root):
        return []
    twins = []
    for here, _dirs, files in os.walk(root):
        for name in files:
            if name.endswith(".md"):
                rel = os.path.relpath(os.path.join(here, name), root)
                twins.append("/" + rel[:-len(".md")].replace(os.sep, "/") + ".html")
    return sorted(twins)


def asset_files(assets):
    """Every file in the asset tree as a URL path, the Markdown twins aside.
    The Worker answers "is there a file at this path" from this list, in
    memory, instead of asking the asset binding: each such question cost a
    round trip, and one request could ask six."""
    out = []
    for here, dirs, files in os.walk(assets):
        if here == assets:
            dirs[:] = [d for d in dirs if d != "_md"]
        for name in files:
            if name != ".DS_Store":
                rel = os.path.relpath(os.path.join(here, name), assets)
                out.append("/" + rel.replace(os.sep, "/"))
    return sorted(out)


def arg(name):
    argv = sys.argv[1:]
    return argv[argv.index(name) + 1] if name in argv and argv.index(name) + 1 < len(argv) else None


def main():
    check = "--check" in sys.argv[1:]
    try:
        with open(NETLIFY_TOML, "rb") as fh:
            doc = tomllib.load(fh)
        check_rest(doc)
        rules = parse_redirects(doc)
        # Netlify applies every matching block from both files. No header is
        # named by both today; if one ever is, netlify.toml is listed last and
        # so wins here.
        headers = (parse_headers_file(HEADERS_FILE) if os.path.isfile(HEADERS_FILE) else []) \
            + parse_headers_toml(doc)
    except Unplaceable as e:
        sys.exit(f"netlify2cf: cannot place a rule, nothing written.\n  {e}")

    total = len(doc.get("redirects", []))
    counts = {}
    for r in rules:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    print(f"netlify2cf: {len(rules)} rules placed of {total} in netlify.toml "
          f"({total - len(rules)} http:// rules that can never fire left out), "
          f"{len(headers)} header blocks")
    print("  " + ", ".join(f"{counts[k]} x {k}" for k in sorted(counts)) + "; "
          f"{sum(r['force'] for r in rules)} forced, "
          f"{sum(r['splat'] for r in rules)} splat, "
          f"{sum('host' in r for r in rules)} host-scoped")
    if check:
        return

    assets = arg("--assets")
    if not assets or not os.path.isfile(os.path.join(assets, "index.html")):
        sys.exit("netlify2cf: --assets DIR must name the built asset tree "
                 "(run `make cf`); the Worker needs its file list.")
    doc_out = {
        "_": "GENERATED by cloudflare/scripts/netlify2cf.py from netlify.toml "
             "and static/_headers. Do not edit; run `make cf`.",
        "primary": PRIMARY,
        "hosts": HOSTS,
        "rules": rules,
        "headers": headers,
        "twins": markdown_twins(assets),
        "files": asset_files(assets),
    }
    print(f"  {len(doc_out['files'])} files, {len(doc_out['twins'])} pages with a Markdown twin")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(doc_out, fh, indent=1)
        fh.write("\n")
    print(f"  -> {os.path.relpath(OUT, _REPO)}")


if __name__ == "__main__":
    main()
