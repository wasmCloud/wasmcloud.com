# wasmcloud.com on Cloudflare Workers

Production is Cloudflare, since 2026-11-19. One Worker, `wasmcloud-www`, serves
the whole Docusaurus build from its static assets with the redirects and
headers Netlify applied, plus a Markdown version of every content page for AI
agents. Netlify still builds and publishes from `main` but receives no
traffic; it is the rollback target until it is retired.

| Hostname | State |
|---|---|
| `wasmcloud.com`, `www.wasmcloud.com`, `docs.wasmcloud.com` | Live on the Worker |
| `next.wasmcloud.com` | The test copy: the same Worker, `noindex` on every response |

**A merge to `main` publishes production.** `.github/workflows/deploy-cloudflare.yml`
deploys and then smoke-tests both hostnames.

## How it fits together

Netlify serves wasmcloud.com from one deploy: the Docusaurus build, the
`redirects` array and `[[headers]]` blocks in `netlify.toml`, and
`static/_headers`. Those files stay the single source of the rules. Netlify
reads them directly; `make cf` turns them into the Worker's routing table.

| Piece | What it does |
|---|---|
| `scripts/netlify2cf.py` | Translates `netlify.toml` and `static/_headers` into `worker/routes.generated.json`. Exits non-zero, naming the rule, on anything it cannot place, including a new top-level section in `netlify.toml`. |
| `scripts/html2md.py` | Writes a Markdown twin of each content page to `build/assets/_md/`, and adds a `<link rel="alternate" type="text/markdown">` tag to that page's `<head>`. |
| `worker/src/` | The Worker: Netlify's redirect and pretty-URL behaviour, and the AI-agent branch. |
| `worker/agents.json` | The AI user agents that get Markdown, and the `Content-Signal` policy. Never add Googlebot or Bingbot. |
| `wrangler.jsonc` | Worker config and the hostnames it is attached to. |
| `scripts/parity.py` | Compares two origins URL by URL and writes `build/parity-report.md`. |
| `scripts/smoke.py` | Checks one deploy does what the rules say. CI runs it after each deploy. |
| `../.github/workflows/deploy-cloudflare.yml` | Builds and publishes on a push to `main`; uploads a no-traffic preview version on a pull request. |

The rules run in the Worker rather than in a Cloudflare `_redirects` file
because the bar is identical answers, and Cloudflare's file differs from
Netlify's where this site depends on it: no force flag, no rules scoped to one
hostname (`docs.wasmcloud.com`), no unforced rules that yield to a file
(`/docs` is a page although a rule names it), and different trailing-slash
handling.

### What the Worker copies from Netlify

All observed on production, and each is in the parity script's fixed list.

- Plain `http` goes to `https` on the same host, and `www` to the bare domain,
  before any rule runs. Neither is in a file. Because of the first, the three
  `http://docs.wasmcloud.com/...` rules in `netlify.toml` can never fire; the
  converter accepts them and leaves them out.
- `pretty_urls = true`: an HTML page answers 200 at its pretty URL
  (`/docs/faq/`, `/404`) and at its file name (`/docs/faq/index.html`). Every
  other spelling that finds it is a 301 to the pretty URL: no trailing slash,
  `/index`, the wrong case, repeated slashes.
- Files are found case-insensitively (`/LLMS.txt`); rules are case-sensitive.
- A rule without `force = true` does not exist where a file does.
- A redirect's `Location` is the target as the rule wrote it (a path stays a
  path), with the visitor's query string added ahead of any fragment.
- A `POST` to a static path answers 400, as Netlify's form handler does.

```
npm run build                    # in the repo root
cd cloudflare
make cf                          # build/assets and worker/routes.generated.json
make cf-test                     # router unit tests
make cf-dev                      # the Worker on http://127.0.0.1:8787 (restart after every make cf)
python3 scripts/parity.py --test http://127.0.0.1:8787
python3 scripts/parity.py                              # wasmcloud.com vs next.wasmcloud.com
python3 scripts/smoke.py https://next.wasmcloud.com
```

`netlify2cf.py` needs Python 3.11 or later: `make cf PYTHON=python3.12`.

Locally, `wrangler dev` pins the hostname, so `make cf-dev` accepts a header
to choose the host under test:

```
curl -sI -H 'x-test-host: docs.wasmcloud.com' http://127.0.0.1:8787/foo
```

**Go easy on production with `parity.py`.** Its first full run here, at 8
threads with no pause, got this machine's address timed out by Netlify's edge
for a while. It now sends at most 5 requests a second to each origin, compares
images, PDFs and fonts with a one-byte range request, and stops if requests stop completing.

## Deploying

By hand, logged in to the Cloudflare account that owns the `wasmcloud.com`
zone (`npx --yes wrangler@4.160.1 whoami` should say Cosmonic):

```
make cf && make cf-deploy
```

CI needs two repository secrets and four repository variables, which a repo
admin adds under Settings, Secrets and variables, Actions:

| Kind | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | A custom token: Account, Workers Scripts, Edit; Zone `wasmcloud.com`, Workers Routes, Edit |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | The Cosmonic account id |
| Variable | `GTM_CONTAINER_ID` | The value Netlify's build uses |
| Variable | `GOOGLE_ANALYTICS_ID` | The value Netlify's build uses |
| Variable | `HUBSPOT_ID` | The value Netlify's build uses |
| Variable | `REO_CLIENT_ID` | The value Netlify's build uses |

The four variables are Netlify build environment variables today. A build
without them ships `localdev` in their place, so the workflow refuses to
publish from `main` until they are set.

Wrangler is pinned to `4.160.1`, not the `4.165.0` cosmonic.com uses: this
repo's `.npmrc` only resolves releases at least 7 days old, and `4.165.0` was
one day old when this was written.

## AI-agent branch

A request gets Markdown when it sends `Accept: text/markdown` or its user
agent is in `worker/agents.json`, and the page would otherwise be a 200 HTML
response with a twin. A page with no twin is served as HTML. Googlebot,
Bingbot and browsers always get the HTML.

| Mechanism | What the Worker does |
|---|---|
| `Accept: text/markdown` | Markdown at the page's own URL. |
| `.md` URL | `/docs/faq.md` and `/docs/faq/index.md` both return the Markdown of `/docs/faq/`; `/index.md` is the home page. Only where no real file or rule answers that path. |
| `Link` header on the HTML | `<https://HOST/docs/faq/index.md>; rel="alternate"; type="text/markdown"` on every page that has a twin. |
| `<link>` tag in the HTML | `<link rel="alternate" type="text/markdown" href="/docs/faq/index.md">` in the `<head>` of the same pages. |
| `Vary: Accept, User-Agent` | On both the HTML and the Markdown. |
| `x-markdown-tokens` | UTF-8 bytes of the Markdown divided by four, rounded up. |
| `Content-Signal` | `ai-train=yes, search=yes, ai-input=yes` on every Markdown response. This is a content-usage policy (contentsignals.org), set in one place: `contentSignal` in `worker/agents.json`. The value is carried over from cosmonic.com. |
| `/llms.txt`, `/llms-full.txt` | Unchanged: `docusaurus-plugin-llms` writes them into the build. |

Every Markdown response from a twin carries `Link: <https://wasmcloud.com/...>;
rel="canonical"` naming the HTML page. A `.md` URL answered from a twin also
carries `X-Robots-Tag: noindex`, because it is a second address for the same
content.

Which pages have a twin: every page with a `<main>` element, a canonical link
and no `noindex` robots meta. On the build of 2026-11-19 that is 671 of 916
pages. The rest are the `noindex` listings (blog and community tag and
pagination pages, the 0.82 docs), the `/people/` pages and `/search/` (no
`<main>` element), three pages with almost no text (`/contact/`,
`/feedback/backstage/`, `/swag/`) and the 404 page.

The 77 `.md` files `docusaurus-plugin-llms` writes for the current docs
(`/docs/glossary.md`, `/docs/overview/index.md`) are real files and are served
as they are, so the links in `llms.txt` return the same bytes as today.

## Known differences from Netlify

Each is listed with its reason in `scripts/parity-allow.txt` or blanked, one
exact pattern at a time, in `BUILD_NOISE` in `scripts/parity.py`.

- **One tag in the HTML.** Pages with a Markdown twin carry
  `<link rel="alternate" type="text/markdown" href="...">` in their `<head>`.
  It is there for every visitor, and it is the fourth of the four mechanisms
  the agentready.md Markdown tester looks for.
- **Docs `.md` files are `text/markdown`.** `netlify.toml` relabels them
  `text/plain` so a browser shows them inline. The Worker serves Markdown as
  `text/markdown` everywhere. Same bytes.
- **No Netlify RUM script.** Netlify appends a `<script
  id="netlify-rum-container">` tag after `</body>` and serves
  `/.netlify/scripts/rum`. Neither exists on Cloudflare.
- 200 HTML responses carry `Vary: Accept, User-Agent`, and a `Link` header
  when the page has a twin.
- ETag values differ.
- Page bodies match production only when the build matches the one Netlify
  published: same commit, same analytics ids. Bundle file names, footnote ids,
  the GitHub star count and HubSpot form container ids differ between any two
  builds and are blanked in the comparison.
- **Two same-date blog posts swap order** between builds (both dated
  2026-04-15), which changes `/blog/archive/`, `/blog/page/2/` and the feeds.
- **One outbound link.** Netlify rewrites `https://msgpack.org/index.html` as
  `https://msgpack.org/` on two pages; the Worker leaves it as written.
- **Slower to first byte on a fresh connection**: around 100 ms of server time
  against roughly 20 on Netlify, measured from one machine on 2026-11-19, and
  the same as cosmonic.com's Worker. Every request goes through the Worker,
  which then fetches the file from the asset store (about 60 ms of it).
  Serving static files straight from the asset layer (`run_worker_first` as a
  list of paths) is the fix; left as is for now.
- Netlify sometimes sends its own default `Strict-Transport-Security`
  (`max-age=31536000`) instead of the `netlify.toml` value. The Worker always
  sends the `netlify.toml` value.

## Parity on 2026-11-19

`wasmcloud.com` against `wasmcloud-www.cosmonic.workers.dev`, 3,484 URLs (61
fixed cases, 708 from the redirect rules, 2,140 build files, 575 from the
sitemap), built from `main` at `735cd018`:

| Check | Result |
|---|---|
| Status codes | 0 differences |
| Redirect targets | 0 of 726 |
| Cache-Control | 0 |
| Custom headers | 0 of 2,758 |
| 404 handling | pass |
| Content-Type | 76, all the docs `.md` files (accepted, above) |
| Page bodies | 7, all accepted above (same-date posts, the msgpack link) |
| AI agents, search crawlers, `noindex` | pass |
| Speed | slower, accepted above |

Images, PDFs and fonts were compared by status, type, caching and length,
not byte for byte (`--full-bodies` does that). Not yet done: the Ahrefs
most-linked URL list (`--extra-urls`), the screenshot comparison, and
`docs.wasmcloud.com` on the edge (it matches in the router tests).

## Before the cutover

Things that are not code and block the move. A person does each.

1. **Add the records the Cloudflare zone is missing.** The nameservers moved
   to Cloudflare on 2026-11-19. Three records in Netlify DNS were not in the
   Cloudflare zone that day: `slack` (A, the two Netlify addresses),
   `arewefastyet` (CNAME `wasmcloud.github.io`) and
   `_github-pages-challenge-wasmcloud` (TXT). Compare the Netlify DNS panel
   with the Cloudflare zone line by line for others.
2. **Set `docs.wasmcloud.com` to DNS-only.** It was proxied on 2026-11-19. It
   works, but Netlify renews that hostname's certificate, and at cutover the
   record is deleted anyway.
3. **Add the CI secrets and variables** listed under Deploying.
4. **Confirm the Workers plan.** The Cosmonic account was moved to Workers
   Paid on 2026-11-19 for cosmonic.com. Free stops serving at 100,000 requests
   a day.
5. **`slack.wasmcloud.com`**: done, see the cutover record below.

### DNS records on 2026-11-19 (Netlify DNS, before the move)

Read from `dns1.p06.nsone.net`. These are the ones a public lookup can find;
the Netlify DNS panel is the full list, so compare against it.

| Name | Type | Value | TTL |
|---|---|---|---|
| `wasmcloud.com` | A (Netlify apex alias) | `98.84.224.111`, `18.208.88.157` | 120 |
| `wasmcloud.com` | AAAA (same alias) | `2600:1f18:16e:df01::258`, `::259` | 311 |
| `www.wasmcloud.com` | A, AAAA | same as the apex | 120 |
| `docs.wasmcloud.com` | CNAME | `brave-albattani-5b0c07.netlify.app` | 3600 |
| `slack.wasmcloud.com` | A, AAAA | same Netlify addresses as the apex | 120 |
| `wasmcloud.com` | MX | `1 aspmx.l.google.com`, `5 alt1.aspmx.l.google.com`, `5 alt2.aspmx.l.google.com`, `10 alt3.aspmx.l.google.com`, `10 alt4.aspmx.l.google.com`, `15 2fvdjvtz2wfpxrqtliln73mrqtrfynt6iqstijnidrrrpmhcf5eq.mx-verification.google.com` | 3600 |
| `wasmcloud.com` | TXT | `v=spf1 include:_spf.google.com ~all` | 3600 |
| `wasmcloud.com` | TXT | `google-site-verification=JBJ3wx99_WcgvRLmHpJBHxS04iVvtTMG7541ZBAIMrI` | 3600 |
| `_dmarc.wasmcloud.com` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@wasmcloud.com` | 3600 |
| `_github-pages-challenge-wasmcloud.wasmcloud.com` | TXT | `56a5abeeaba8ab91bd10967374218c` | 3600 |
| `wasmcloud.com` | CAA | `0 issue "letsencrypt.org;accounturi=https://acme-v02.api.letsencrypt.org/acme/acct/54403714"` | 3600 |

Not found by guessing names, so check the panel for them: DKIM selectors
(`google._domainkey` did not answer), `arewefastyet.wasmcloud.com` (the docs
link to it) and anything else under the zone.

In the Cloudflare zone, the apex and `www` cannot be Netlify's alias type.
Use what Netlify documents for external DNS: `wasmcloud.com` as a CNAME to
`brave-albattani-5b0c07.netlify.app` (Cloudflare flattens a CNAME at the apex)
or an A record to Netlify's load balancer, and `www` as a CNAME to the same
`netlify.app` name. All DNS-only.

## Cutover: done 2026-11-19

The three hostnames moved to the Worker between 19:32 and 19:37 UTC, in the
order `www`, the bare domain, `docs`. For each, its DNS records were deleted
in the dashboard and the hostname attached about five seconds later with
`wrangler triggers deploy`, which changes hostnames without uploading a new
version. The bare domain answered 200 on 30 of 30 requests over the next
three minutes; no 522s were seen.

What was different from the plan:

- The nameservers had moved from Netlify DNS to Cloudflare the same
  afternoon, against the runbook's "separate days".
- Three records were missing from the Cloudflare zone after that move
  (`slack`, `arewefastyet`, `_github-pages-challenge-wasmcloud`) and were
  added before the cutover. `slack.wasmcloud.com` did not resolve for part of
  the afternoon.
- The deploy workflow was disabled for the cutover, so a merge to `main`
  could not deploy the old config and detach the live hostnames.

Records deleted, for a rollback (all DNS-only, TTL Auto):

| Name | Type | Value |
|---|---|---|
| `wasmcloud.com` | A | `18.208.88.157`, `98.84.224.111` |
| `wasmcloud.com` | AAAA | `2600:1f18:16e:df01::258`, `2600:1f18:16e:df01::259` |
| `www.wasmcloud.com` | A | `18.208.88.157`, `98.84.224.111` |
| `www.wasmcloud.com` | AAAA | `2600:1f18:16e:df01::258`, `2600:1f18:16e:df01::259` |
| `docs.wasmcloud.com` | CNAME | `brave-albattani-5b0c07.netlify.app` (was proxied; recreate DNS-only) |

`slack.wasmcloud.com` moved the same day, at 19:45 UTC. It was a separate
Netlify project serving one page that forwards to the Slack invite; it is now
its own small Worker, `wasmcloud-slack`, in `cloudflare/slack/`, serving the
same page byte for byte. It is deployed by hand from that folder, not by the
workflow. Its Netlify records were A `18.208.88.157` and `98.84.224.111`
(Netlify DNS also answered AAAA `2600:1f18:16e:df01::258` and `::259`).

The checklist as it was written, kept for the rollback steps:

## Cutover checklist

**Day before**

- [ ] The zone is active on Cloudflare's nameservers and has been for days
- [ ] `https://next.wasmcloud.com/` answers, with a valid certificate
- [ ] `python3 scripts/parity.py` is clean against the latest production deploy
- [ ] Add `{ "pattern": "docs-next.wasmcloud.com", "custom_domain": true }` to
      `routes`, deploy, and compare the legacy host:
      `python3 scripts/parity.py --skip-test-host-checks --limit 60 --prod https://docs.wasmcloud.com --test https://docs-next.wasmcloud.com`
- [ ] The merge-to-`main` deploy in CI has succeeded at least once
- [ ] Write down every record you are about to delete: name, type, target,
      proxy status, TTL
- [ ] Confirm the custom domains and certificates stay on the Netlify project
- [ ] Save a baseline:
      `python3 scripts/parity.py --skip-test-host-checks --test https://wasmcloud.com --save build/parity-baseline.json`
- [ ] The Cloudflare DNS page is open in a browser tab, signed in

**Cutover** (one hostname at a time: `www`, then the bare domain, then `docs`)

- [ ] Add the hostname to `routes` in a staged copy of `wrangler.jsonc`
      (`custom_domain: true`)
- [ ] Delete its DNS record in the dashboard. Wrangler refuses to replace a
      record it did not create (error 100117)
- [ ] Straight away: `npx --yes wrangler@4.160.1 triggers deploy -c <staged config>`
- [ ] Check it at Cloudflare directly:
      `curl -sI --resolve www.wasmcloud.com:443:<a Cloudflare IP for next.wasmcloud.com> https://www.wasmcloud.com/`
      and look for `server: cloudflare` and the right status
- [ ] Wait three minutes before judging it. A newly attached hostname answered
      522 on some requests for a minute or two on cosmonic.com

**After the bare domain**

- [ ] `curl -sI https://wasmcloud.com/ | grep -i x-robots-tag` prints nothing
- [ ] `python3 scripts/parity.py --baseline build/parity-baseline.json` is clean
- [ ] `python3 scripts/smoke.py https://wasmcloud.com` passes
- [ ] `http://wasmcloud.com/` and `https://www.wasmcloud.com/` both redirect to
      `https://wasmcloud.com/`
- [ ] `https://docs.wasmcloud.com/foo` is a 301 to `https://wasmcloud.com/docs/foo`
- [ ] `https://agentready.md/tools/markdown-tester` on `https://wasmcloud.com/docs/overview/`

**Straight after the last hostname**

- [ ] Open and merge the pull request that puts the live hostnames in
      `wrangler.jsonc`, turns `workers_dev` off, and sets `SMOKE_URL` in the
      workflow. Until it lands, the next merge deploys a config that lists
      only the test hostname.

**Rollback** (any failure, any time in the first two weeks)

- [ ] Remove the hostname from `routes` and from the Worker (Workers & Pages,
      the Worker, Settings, Domains & Routes). Removing a custom domain
      deletes its DNS record
- [ ] Recreate the record exactly as written down, DNS-only
- [ ] Netlify serves again as soon as resolvers see the record

The Wrangler login cannot edit DNS. Rollback needs the dashboard.

**After two clean weeks**

- [ ] Remove the custom domains from the Netlify project and disconnect its
      Git integration
- [ ] Set `CONTEXT=production` in the workflow if anything in the build has
      come to depend on it
- [ ] Update `README.md` and `CONTRIBUTING.md` so nobody thinks a Netlify
      deploy reaches visitors
