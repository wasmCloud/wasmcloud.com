"""Write a Markdown twin of every page in the build, for AI agents.

The Cloudflare Worker serves these to AI crawlers and to anything that asks for
`Accept: text/markdown`, in place of the HTML at the same URL. The rule that
governs everything here: the Markdown must say what the page says. Less markup,
never different or missing claims. So when in doubt this over-includes.

    python3 scripts/html2md.py <assets_dir>

walks every `*.html` under <assets_dir> and writes
`<assets_dir>/_md/<same path>.md` (`docs/faq/index.html` ->
`_md/docs/faq/index.md`). It then adds one tag to the <head> of each page it
converted, in the assets copy only:

    <link rel="alternate" type="text/markdown" href="/docs/faq/index.md">

That tag is how a client holding the HTML finds the Markdown, alongside the
`Link` header the Worker sends. It is the one place the HTML served from
Cloudflare differs from the Docusaurus build, and it is the same for every
visitor.

What becomes Markdown is the page's `<main>`. Docusaurus keeps the navbar, the
docs sidebar and the footer outside it. Inside `<main>` the only things dropped
are ones a reader never sees as content: script, style, svg, canvas, template,
noscript, iframe, form controls, buttons, anything `aria-hidden="true"`,
images marked decorative with an empty alt, the "back to reference" arrow on a
footnote, and the navigation Docusaurus puts inside `<main>` (the breadcrumb
trail, both tables of contents, the previous/next links, the "edit this page"
link and the invisible anchor link beside every heading; see DROP_CLASSES). An
admonition becomes a blockquote led by its label, and a tab group becomes each
tab's label followed by that tab's content, so nothing behind an unselected
tab is lost.

A page is skipped, not converted, when it is not a content page: no `<main>`,
no canonical link, a `noindex` robots meta, the not-found page, or a page
whose `<main>` holds almost no text (the search page, which is filled in by
script). Skips are printed with the reason.

Stdlib only and deterministic: the same build gives the same bytes.

Exits non-zero if more than MAX_THIN of the pages came out nearly empty, since
that means a selector stopped matching and agents would be served blanks.
"""
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, urlunsplit

SITE = "https://wasmcloud.com"
SITE_HOSTS = {"wasmcloud.com", "www.wasmcloud.com", "docs.wasmcloud.com"}
# Below this many characters of body a page is not worth a twin: it is served
# as HTML. More than MAX_THIN such pages (as a share of all pages) fails the
# run, because that many at once means the page structure changed.
MIN_BODY = 200
MAX_THIN = 0.02

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}
# Never content, wherever they appear.
DROP = {"script", "style", "svg", "canvas", "template", "noscript", "iframe",
        "button", "input", "select", "textarea", "form", "object", "embed",
        "link", "meta", "col", "colgroup"}
BLOCK = {"p", "div", "section", "article", "header", "footer", "main", "aside",
         "figure", "figcaption", "ul", "ol", "li", "dl", "dt", "dd", "table",
         "pre", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "details",
         "summary", "hr", "nav", "video", "address", "caption", "thead",
         "tbody", "tfoot", "tr", "td", "th", "picture"}
HEADINGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
# html.parser does not apply the HTML rules for omitted end tags, and the
# hand-authored pages omit them. Opening one of these closes the listed open
# element first, searching no further up than the stop set.
P_CLOSERS = BLOCK - {"td", "th", "tr", "thead", "tbody", "tfoot", "caption"}
IMPLIED = {
    "li": ({"li"}, {"ul", "ol"}),
    "dt": ({"dt", "dd"}, {"dl"}),
    "dd": ({"dt", "dd"}, {"dl"}),
    "tr": ({"tr"}, {"table", "thead", "tbody", "tfoot"}),
    "td": ({"td", "th"}, {"tr", "table"}),
    "th": ({"td", "th"}, {"tr", "table"}),
    "thead": ({"thead", "tbody", "tfoot", "tr"}, {"table"}),
    "tbody": ({"thead", "tbody", "tfoot", "tr"}, {"table"}),
    "tfoot": ({"thead", "tbody", "tfoot", "tr"}, {"table"}),
}
# Theme duplicates: the same image twice, one per colour scheme, with CSS
# showing one. Keep the day copy.
NIGHT_IMG = {"nt", "wl-night"}
# Docusaurus chrome that sits inside <main> but is navigation, not the page.
DROP_CLASSES = {
    "theme-doc-breadcrumbs",        # the breadcrumb trail
    "theme-doc-toc-mobile",         # "On this page", collapsed, on small screens
    "theme-doc-toc-desktop",        # the same list in the right-hand column
    "table-of-contents",
    "pagination-nav",               # previous / next page
    "theme-edit-this-page",
    "hash-link",                    # the "#" beside a heading; its text is U+200B
}
# CSS-module class names end in a build hash (themedComponent--dark_tMUR), so
# these match on the stable part: the dark-theme twin of a themed image.
DROP_CLASS_PREFIXES = ("themedComponent--dark",)


class Node:
    __slots__ = ("tag", "attrs", "kids", "parent")

    def __init__(self, tag, attrs=(), parent=None):
        self.tag = tag
        self.attrs = {k: (v if v is not None else "") for k, v in attrs}
        self.kids = []
        self.parent = parent

    def classes(self):
        return set(self.attrs.get("class", "").split())

    def find(self, tag):
        """Depth-first, the first descendant with this tag."""
        for k in self.kids:
            if isinstance(k, Node):
                if k.tag == tag:
                    return k
                hit = k.find(tag)
                if hit is not None:
                    return hit
        return None

    def findall(self, tag, out=None):
        out = [] if out is None else out
        for k in self.kids:
            if isinstance(k, Node):
                if k.tag == tag:
                    out.append(k)
                k.findall(tag, out)
        return out


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.cur = self.root

    def _close_implied(self, tag):
        if tag in P_CLOSERS:
            n = self.cur
            # a <p> cannot contain a block; only look through inline wrappers
            while n is not self.root and n.tag not in BLOCK:
                n = n.parent
            if n is not self.root and n.tag == "p":
                self.cur = n.parent
        if tag in IMPLIED:
            close, stop = IMPLIED[tag]
            n = self.cur
            while n is not self.root and n.tag not in stop:
                if n.tag in close:
                    self.cur = n.parent
                    break
                n = n.parent

    def handle_starttag(self, tag, attrs):
        self._close_implied(tag)
        n = Node(tag, attrs, self.cur)
        self.cur.kids.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self._close_implied(tag)
        self.cur.kids.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def parse(html):
    t = Tree()
    t.feed(html)
    t.close()
    return t.root


# --------------------------------------------------------------------------
# rendering
# --------------------------------------------------------------------------

def dropped(n):
    if n.tag in DROP:
        return True
    if n.attrs.get("aria-hidden") == "true":
        return True
    cls = n.attrs.get("class")
    if cls:
        for c in cls.split():
            if c in DROP_CLASSES or c.startswith(DROP_CLASS_PREFIXES):
                return True
    if n.tag == "img" and (n.classes() & NIGHT_IMG or n.attrs.get("alt") == ""):
        return True                         # theme duplicate, or decorative
    if n.tag == "a" and re.match(r"#fnref", n.attrs.get("href", "")):
        return True                         # a footnote's "back to text" arrow
    return False


def has_block(n):
    for k in n.kids:
        if isinstance(k, Node) and not dropped(k):
            if k.tag in BLOCK or has_block(k):
                return True
    return False


def esc(text):
    """Escape the few characters that would change meaning as Markdown."""
    text = text.replace("\\", "\\\\")
    text = re.sub(r"([*<\[\]`])", r"\\\1", text)
    # an underscore only opens emphasis at a word edge; snake_case is safe
    text = re.sub(r"(?<![A-Za-z0-9])_|_(?![A-Za-z0-9])", r"\\_", text)
    return text


def wrap(mark, inner):
    """**x** with the surrounding whitespace kept outside the markers."""
    core = inner.strip()
    if not core:
        return inner
    lead = inner[: len(inner) - len(inner.lstrip())]
    trail = inner[len(inner.rstrip()):]
    return f"{lead}{mark}{core}{mark}{trail}"


def tidy(s):
    """Collapse runs of spaces left by inline assembly; keep hard breaks."""
    s = re.sub(r"[ \t\r\f\v]*\n[ \t\r\f\v]*", "\n", s)
    s = re.sub(r"[ \t\r\f\v]+", " ", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()


def text_of(n):
    """Plain text, for alt-less labels and code."""
    out = []
    for k in n.kids:
        if isinstance(k, str):
            out.append(k)
        elif not dropped(k):
            out.append("\n" if k.tag == "br" else text_of(k))
    return "".join(out)


def chip(n):
    """True for an inline element that CSS lays out as its own box.

    Styled spans, images and <small> sit side by side in the markup with no
    whitespace between them ("<span class=k>net</span><span class=v>granted
    </span>") and are separated on screen by layout alone. Flattened to text
    they would run together into one word, so glue() puts a space back.
    """
    # A bare <span> counts too: with no class it is no use to prose, so it is
    # there as a layout hook for a parent selector ("label<span>sub</span>").
    return n.tag in ("img", "small", "video", "span", "a") or (
        n.tag in ("b", "strong", "i", "em") and bool(n.attrs.get("class")))


_OPENERS = "([{/\u2018\u201c\"'-\u2013\u2014"


class Run(list):
    """The pieces of one inline run, remembering whether the last was boxed."""
    boxed = False


def glue(out, piece, boxed):
    """Append an inline piece, restoring the space that layout supplied."""
    if not piece:
        return
    prev = out[-1] if out else ""
    if prev and (boxed or out.boxed) and not prev[-1].isspace() \
            and prev[-1] not in _OPENERS \
            and (piece[0].isalnum() or piece[0] in "![(*~`"):
        out.append(" ")
    out.append(piece)
    out.boxed = boxed


class Page:
    def __init__(self, canonical):
        self.base = canonical

    # -- urls ---------------------------------------------------------------
    def url(self, href):
        href = (href or "").strip()
        if not href:
            return ""
        scheme = urlsplit(href).scheme.lower()
        if scheme in ("mailto", "tel"):
            return href
        if scheme and scheme not in ("http", "https"):
            return ""                       # javascript:, data: are not links
        u = urlsplit(urljoin(self.base, href))
        if u.netloc.lower() in SITE_HOSTS:
            u = u._replace(scheme="https", netloc="wasmcloud.com")
        return urlunsplit(u).replace(" ", "%20").replace("(", "%28").replace(")", "%29")

    # -- inline -------------------------------------------------------------
    def inline(self, n):
        out = Run()
        for k in n.kids:
            if isinstance(k, str):
                glue(out, esc(re.sub(r"\s+", " ", k)), False)
            elif not dropped(k):
                glue(out, self.inline_el(k), chip(k))
        return "".join(out)

    def inline_el(self, n):
        tag = n.tag
        label = re.sub(r"\s+", " ", n.attrs.get("aria-label", "")).strip()
        if label and tag not in ("a", "img", "video", "sup") and tag not in BLOCK:
            # A status chip that shows "Partial" and is labelled "Space:
            # Partial": the label is the fuller statement of the same thing.
            shown = re.sub(r"\s+", " ", text_of(n)).strip()
            if shown and len(label) > len(shown) and shown.lower() in label.lower():
                return f"({esc(label)})"
        if tag == "br":
            return "\n"
        if tag == "img":
            return self.img(n)
        if tag == "code":
            code = re.sub(r"\s+", " ", text_of(n)).strip()
            if not code:
                return ""
            fence = "``" if "`" in code else "`"
            pad = " " if code.startswith("`") or code.endswith("`") else ""
            return f"{fence}{pad}{code}{pad}{fence}"
        if tag in ("strong", "b"):
            return wrap("**", self.inline(n))
        if tag in ("em", "i", "cite", "dfn"):
            return wrap("*", self.inline(n))
        if tag in ("del", "s"):
            return wrap("~~", self.inline(n))
        if tag == "a":
            return self.link(n)
        if tag == "sup":
            ref = self.fnref(n)
            if ref:
                return ref
            inner = self.inline(n).strip()
            return f"<sup>{inner}</sup>" if inner else ""
        if tag == "sub":
            inner = self.inline(n).strip()
            return f"<sub>{inner}</sub>" if inner else ""
        if tag == "video":
            return self.video(n)
        if tag in BLOCK:
            # a block reached from an inline context (a table cell, a link
            # wrapping a card): flatten it, separated from its neighbours
            return " " + " ".join(b.replace("\n", " ") for b in self.blocks(n, flat=True)) + " "
        return self.inline(n)

    def fnref(self, sup):
        a = sup.find("a")
        if a is not None:
            m = re.match(r"#fn-?(\w+)$", a.attrs.get("href", ""))
            if m:
                return f"[^{m.group(1)}]"
        return ""

    def link(self, n):
        m = re.match(r"#fn-?(\w+)$", n.attrs.get("href", ""))
        if m and n.attrs.get("id", "").startswith("fnref"):
            return f"[^{m.group(1)}]"
        label = tidy(self.inline(n)).replace("\n", " ")
        if not label:
            label = esc(n.attrs.get("aria-label", "") or n.attrs.get("title", ""))
        href = self.url(n.attrs.get("href"))
        if not label:
            return ""
        if not href:
            return label
        return f"[{label}]({href})"

    def img(self, n):
        src = n.attrs.get("data-src-day") or n.attrs.get("src") or n.attrs.get("data-src")
        src = self.url(src)
        alt = esc(re.sub(r"\s+", " ", n.attrs.get("alt", "")).strip())
        if not src:
            return alt
        return f"![{alt}]({src})"

    def video(self, n):
        src = n.attrs.get("src")
        if not src:
            s = n.find("source")
            src = s.attrs.get("src") if s is not None else ""
        src = self.url(src)
        label = esc(n.attrs.get("aria-label") or n.attrs.get("title") or "Video")
        return f"[{label}]({src})" if src else ""

    # -- blocks -------------------------------------------------------------
    def blocks(self, n, flat=False):
        """The Markdown blocks for a container's children, in order."""
        out, run = [], Run()

        def flush():
            if run:
                text = tidy("".join(run))
                if text:
                    out.append(text.replace("\n", "  \n"))
                run.clear()

        for k in n.kids:
            if isinstance(k, str):
                glue(run, esc(re.sub(r"\s+", " ", k)), False)
                continue
            if dropped(k):
                continue
            if k.tag in BLOCK:
                flush()
                out.extend(self.block(k))
            elif has_block(k):
                flush()
                inner = self.blocks(k)
                if k.tag == "a":
                    inner = self.link_blocks(k, inner)
                out.extend(inner)
            else:
                glue(run, self.inline_el(k), chip(k))
        flush()
        return out

    def link_blocks(self, a, inner):
        """A link wrapping whole blocks (a card): link its first line."""
        href = self.url(a.attrs.get("href"))
        if not href or not inner:
            return inner
        for i, b in enumerate(inner):
            m = re.match(r"(#{1,6} )(.*)$", b, re.S)
            if m and "](" not in m.group(2):
                inner[i] = f"{m.group(1)}[{m.group(2)}]({href})"
                return inner
        for i, b in enumerate(inner):
            if "\n" not in b and "](" not in b and not b.startswith(("|", "-", ">", "```")):
                inner[i] = f"[{b}]({href})"
                return inner
        label = esc(a.attrs.get("aria-label", "")) or href
        return inner + [f"[{label}]({href})"]

    def block(self, n):
        tag = n.tag
        m = re.match(r"fn-?(\w+)$", n.attrs.get("id", ""))
        if m and tag in ("p", "div", "li"):
            # a footnote written as a paragraph: <p id="fn-x"><sup>1</sup> …
            text = " ".join(b.replace("\n", " ") for b in self.blocks(n))
            text = re.sub(r"^<sup>[^<]*</sup>\s*", "", text)
            return [f"[^{m.group(1)}]: {text}"] if text else []
        if tag in HEADINGS:
            text = tidy(self.inline(n)).replace("\n", " ")
            return [f"{'#' * int(tag[1])} {text}"] if text else []
        if tag == "div":
            classes = n.classes()
            if "theme-admonition" in classes:
                return self.admonition(n)
            if "tabs-container" in classes:
                return self.tabs(n)
        if tag == "p":
            if has_block(n):
                return self.blocks(n)
            text = tidy(self.inline(n))
            return [text.replace("\n", "  \n")] if text else []
        if tag in ("ul", "ol"):
            return self.list(n)
        if tag == "dl":
            return self.dl(n)
        if tag == "table":
            return self.table(n)
        if tag == "pre":
            return self.pre(n)
        if tag == "hr":
            return ["---"]
        if tag == "blockquote":
            return self.quote(self.blocks(n))
        if tag == "aside":
            return self.quote(self.blocks(n))
        if tag == "details":
            return self.details(n)
        if tag == "summary":
            text = tidy(self.inline(n)).replace("\n", " ")
            return [f"**{text}**"] if text else []
        if tag == "figcaption" or tag == "caption":
            text = tidy(self.inline(n)).replace("\n", " ")
            return [wrap("*", text)] if text else []
        if tag == "video":
            v = self.video(n)
            return [v] if v else []
        # every other block is a plain container
        return self.blocks(n)

    def admonition(self, n):
        """Docusaurus :::tip and friends: a blockquote led by the label.

        <div class="theme-admonition theme-admonition-tip ..."><div class=
        admonitionHeading_x><span><svg/></span>tip</div><div class=
        admonitionContent_x>...</div></div>. The heading is the type unless the
        author gave a title of their own.
        """
        head = next((k for k in n.kids if isinstance(k, Node)
                     and any(c.startswith("admonitionHeading") for c in k.classes())), None)
        label = tidy(self.inline(head)).replace("\n", " ") if head is not None else ""
        if not label:
            label = next((c[len("theme-admonition-"):] for c in sorted(n.classes())
                          if c.startswith("theme-admonition-")), "note")
        if label == label.lower():
            label = label.capitalize()           # "tip" as written, "Tip" as shown
        rest = Node("div")
        rest.kids = [k for k in n.kids if k is not head]
        return self.quote([f"**{label}**"] + self.blocks(rest))

    def tabs(self, n):
        """A tab group: every tab's content, each under its own label.

        Only one panel shows at a time on screen, but which one is the
        reader's choice, so all of them are the page's content.
        """
        def own(el):
            p = el.parent
            while p is not None and "tabs-container" not in p.classes():
                p = p.parent
            return p is n

        labels = [tidy(self.inline(li)).replace("\n", " ") for li in n.findall("li")
                  if li.attrs.get("role") == "tab" and own(li)]
        panels = [d for d in n.findall("div") if d.attrs.get("role") == "tabpanel" and own(d)]
        if not panels:
            return self.blocks(n)
        out = []
        for i, panel in enumerate(panels):
            inner = self.blocks(panel)
            if not inner:
                continue
            if i < len(labels) and labels[i]:
                out.append(f"**{labels[i]}**")
            out.extend(inner)
        return out

    def quote(self, inner):
        if not inner:
            return []
        lines = "\n\n".join(inner).split("\n")
        return ["\n".join((">" + (" " + ln if ln else "")) for ln in lines)]

    def details(self, n):
        out = []
        summary = next((k for k in n.kids if isinstance(k, Node) and k.tag == "summary"), None)
        if summary is not None:
            if has_block(summary):
                head = self.blocks(summary)
                out.extend(head)
            else:
                text = tidy(self.inline(summary)).replace("\n", " ")
                if text:
                    out.append(f"**{text}**")
        rest = Node("div")
        rest.kids = [k for k in n.kids if k is not summary]
        out.extend(self.blocks(rest))
        return out

    def list(self, n):
        ordered = n.tag == "ol"
        try:
            num = int(n.attrs.get("start", "1"))
        except ValueError:
            num = 1
        lines = []
        for k in n.kids:
            if not isinstance(k, Node) or dropped(k):
                continue
            if k.tag != "li":
                # stray content directly in a list: keep it as its own item
                inner = self.block(k) if k.tag in BLOCK else [tidy(self.inline_el(k))]
            else:
                inner = self.blocks(k)
            inner = [b for b in inner if b]
            if not inner:
                continue
            marker = f"{num}. " if ordered else "- "
            num += 1
            pad = " " * len(marker)
            body = "\n\n".join(inner) if self.loose(inner) else "\n".join(inner)
            body_lines = body.split("\n")
            lines.append(marker + body_lines[0])
            lines.extend((pad + ln) if ln else "" for ln in body_lines[1:])
        return ["\n".join(lines)] if lines else []

    @staticmethod
    def loose(inner):
        """A list item needs blank lines between its blocks unless the only
        extra block is a nested list."""
        rest = inner[1:]
        return any(not re.match(r"(- |\d+\. )", b) for b in rest)

    def dl(self, n):
        out = []
        term = None
        for k in n.kids:
            if not isinstance(k, Node) or dropped(k):
                continue
            if k.tag == "dt":
                if term:
                    out.append(f"**{term}**")
                term = tidy(self.inline(k)).replace("\n", " ") or None
            elif k.tag == "dd":
                inner = self.blocks(k)
                if term and inner and "\n" not in inner[0] and not inner[0].startswith(("|", "```", ">", "#")):
                    inner[0] = f"**{term}:** {inner[0]}" if not term.endswith((":", "?")) else f"**{term}** {inner[0]}"
                elif term:
                    out.append(f"**{term}**")
                term = None
                out.extend(inner)
            else:
                # a wrapper div around dt/dd pairs
                if term:
                    out.append(f"**{term}**")
                    term = None
                out.extend(self.dl(k) if k.find("dt") is not None else self.block(k) if k.tag in BLOCK else [tidy(self.inline_el(k))])
        if term:
            out.append(f"**{term}**")
        return [b for b in out if b]

    def cell(self, n):
        text = tidy(self.inline(n))
        return text.replace("|", "\\|").replace("\n", "<br>")

    def table(self, n):
        out = []
        cap = next((k for k in n.kids if isinstance(k, Node) and k.tag == "caption"), None)
        if cap is not None:
            out.extend(self.block(cap))
        rows = []
        for tr in n.findall("tr"):
            # only this table's rows, not a nested table's
            p = tr.parent
            while p is not None and p.tag != "table":
                p = p.parent
            if p is not n:
                continue
            cells = []
            for c in tr.kids:
                if isinstance(c, Node) and c.tag in ("td", "th") and not dropped(c):
                    text = self.cell(c)
                    cells.append(text)
                    try:
                        span = int(c.attrs.get("colspan", "1"))
                    except ValueError:
                        span = 1
                    cells.extend([""] * (span - 1))
            if cells:
                rows.append((cells, tr.parent.tag == "thead" or all(
                    isinstance(c, Node) and c.tag == "th" for c in tr.kids if isinstance(c, Node))))
        if not rows:
            return out
        width = max(len(c) for c, _ in rows)
        rows = [(c + [""] * (width - len(c)), h) for c, h in rows]
        if rows[0][1]:
            head, body = rows[0][0], rows[1:]
        else:
            head, body = [""] * width, rows
        lines = ["| " + " | ".join(head) + " |", "|" + " --- |" * width]
        lines += ["| " + " | ".join(c) + " |" for c, _ in body]
        out.append("\n".join(lines))
        return out

    def pre(self, n):
        code = n.find("code")
        lang = ""
        for el in (code, n):
            if el is None:
                continue
            for c in el.attrs.get("class", "").split():
                m = re.match(r"(?:language|lang)-([\w+#.-]+)$", c)
                if m:
                    lang = m.group(1)
            lang = lang or el.attrs.get("data-lang", "") or el.attrs.get("data-language", "")
            if lang:
                break
        text = text_of(n).strip("\n")
        if not text.strip():
            return []
        fence = "```"
        while fence in text:
            fence += "`"
        return [f"{fence}{lang}\n{text}\n{fence}"]

    def footnotes(self, section):
        """<section class="footnotes"><ol><li id="fn-3">…</li></ol></section>"""
        out = []
        for li in section.findall("li"):
            m = re.match(r"fn-?(\w+)$", li.attrs.get("id", ""))
            text = " ".join(b.replace("\n", " ") for b in self.blocks(li))
            if not text:
                continue
            out.append(f"[^{m.group(1)}]: {text}" if m else f"- {text}")
        return out


class WithFootnotes(Page):
    def block(self, n):
        if n.tag in ("section", "div", "ol") and "footnotes" in n.classes():
            notes = self.footnotes(n)
            if notes:
                return ["\n".join(notes)]
        return super().block(n)


# --------------------------------------------------------------------------
# per page
# --------------------------------------------------------------------------

def yaml_str(s):
    s = re.sub(r"\s+", " ", s).strip()
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def head_meta(root):
    title = desc = canonical = ""
    robots = ""
    head = root.find("head") or root
    t = head.find("title")
    if t is not None:
        title = text_of(t)
    for m in head.findall("meta"):
        name = m.attrs.get("name", "").lower()
        if name == "description" and not desc:
            desc = m.attrs.get("content", "")
        elif name == "robots":
            robots += " " + m.attrs.get("content", "").lower()
    for l in head.findall("link"):
        if "canonical" in l.attrs.get("rel", "").lower().split() and not canonical:
            canonical = l.attrs.get("href", "").strip()
    return title, desc, canonical, robots


def convert(html):
    """(markdown, None) for a content page, (None, reason) for a skip."""
    root = parse(html)
    title, desc, canonical, robots = head_meta(root)
    if "noindex" in robots:
        return None, "noindex robots meta (not a content page)"
    if not canonical:
        return None, "no canonical link"
    main = root.find("main")
    if main is None:
        return None, "no <main> element"
    page = WithFootnotes(canonical)
    body = "\n\n".join(b for b in page.blocks(main) if b.strip())
    body = re.sub(r"[ \t]+\n", lambda m: m.group(0) if m.group(0) == "  \n" else "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    front = "---\n" + "".join(
        f"{k}: {yaml_str(v)}\n" for k, v in
        (("title", title), ("description", desc), ("canonical", canonical))) + "---\n"
    return front + "\n" + body + "\n", None


def main():
    args = [a for a in sys.argv[1:] if a != "--verbose"]
    verbose = "--verbose" in sys.argv[1:]
    if len(args) != 1:
        sys.exit("usage: python3 scripts/html2md.py [--verbose] <assets_dir>")
    assets = os.path.abspath(args[0])
    if not os.path.isdir(assets):
        sys.exit(f"html2md: {assets} is not a directory")
    out_root = os.path.join(assets, "_md")

    pages = []
    for d, dirs, files in os.walk(assets):
        dirs[:] = sorted(x for x in dirs if not (d == assets and x == "_md"))
        for f in sorted(files):
            if f.endswith(".html"):
                pages.append(os.path.relpath(os.path.join(d, f), assets))

    done = skipped = 0
    thin = []
    for rel in sorted(pages):
        if os.path.basename(rel) == "404.html":
            # Docusaurus gives its error page a canonical and no noindex, so
            # the checks in convert() would take it for a content page.
            skipped += 1
            print(f"  skip {rel}: the not-found page")
            continue
        with open(os.path.join(assets, rel), encoding="utf-8") as fh:
            md, why = convert(fh.read())
        if md is None:
            skipped += 1
            print(f"  skip {rel}: {why}")
            continue
        body = md.split("\n---\n", 1)[1].strip()
        if len(body) < MIN_BODY:
            thin.append((rel, len(body)))
            skipped += 1
            print(f"  skip {rel}: only {len(body)} characters of Markdown")
            continue
        dst = os.path.join(out_root, rel[:-5] + ".md")
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(md)
        advertise(os.path.join(assets, rel), rel)
        done += 1
        if verbose:
            print(f"  ok   {rel} -> _md/{rel[:-5]}.md ({len(body.split())} words)")

    print(f"html2md: {done} converted, {skipped} skipped")
    if not done:
        sys.exit("html2md: no page was converted")
    if len(thin) > MAX_THIN * len(pages):
        sys.exit(f"html2md: {len(thin)} of {len(pages)} pages produced almost no "
                 "Markdown; the page structure has probably changed.")


def md_href(rel):
    """The .md URL advertised for an HTML asset: docs/faq/index.html ->
    /docs/faq/index.md, index.html -> /index.md. Must agree with
    markdownAlternate() in worker/src/router.js."""
    rel = rel.replace(os.sep, "/")
    if rel.endswith("/index.html") or rel == "index.html":
        return "/" + rel[:-len("index.html")] + "index.md"
    return "/" + rel[:-len(".html")] + "/index.md"


def advertise(path, rel):
    """Add the <link rel="alternate" type="text/markdown"> tag to one page."""
    with open(path, encoding="utf-8", newline="") as fh:
        html = fh.read()
    if 'type="text/markdown"' in html[:html.find("</head>") + 1]:
        return
    tag = f'<link rel="alternate" type="text/markdown" href="{md_href(rel)}">'
    at = html.find("</head>")
    if at < 0:
        return
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(html[:at] + tag + html[at:])


if __name__ == "__main__":
    main()
