# wasmcloud.com on Cloudflare Workers. See CLOUDFLARE-MIGRATION.md.
#
#   make cf          build build/assets and worker/routes.generated.json from ../build
#   make cf-dev      run the Worker locally on :8787
#   make cf-test     unit-test the router
#   make cf-deploy   publish to the hostnames in wrangler.jsonc
#
# Build the site first, from the repo root: npm run build

# netlify2cf.py needs tomllib, so Python 3.11 or later.
PYTHON ?= python3
# The Docusaurus build to publish.
SITE_BUILD ?= ../build
# Pinned on purpose: `npx wrangler` resolves the newest CLI at run time, with
# credentials that can publish the site. The repo's .npmrc only resolves
# releases at least 7 days old, so bump to a version that old or older, here
# and in .github/workflows/deploy-cloudflare.yml.
WRANGLER ?= npx --yes wrangler@4.160.1

.PHONY: cf cf-dev cf-test cf-deploy

cf:
	@[ -s "$(SITE_BUILD)/index.html" ] || { echo "No site build at $(SITE_BUILD). Run 'npm run build' in the repo root first."; exit 1; }
	$(PYTHON) scripts/netlify2cf.py --check >/dev/null
	rm -rf build/assets
	mkdir -p build/assets
	@# _headers and _redirects are Netlify's files: the Worker reads its rules
	@# from the generated table, and the asset layer must not apply them too.
	rsync -a --exclude=/_headers --exclude=/_redirects --exclude=.DS_Store "$(SITE_BUILD)/" build/assets/
	$(PYTHON) scripts/html2md.py build/assets | tail -1
	@# Last, because the table also lists which pages html2md.py just wrote a
	@# Markdown twin for.
	$(PYTHON) scripts/netlify2cf.py --assets build/assets
	@echo "→ build/assets ($$(find build/assets -type f | wc -l | tr -d ' ') files), worker/routes.generated.json"

# DEV_HOST_HEADER lets a request choose the hostname under test, because
# `wrangler dev` pins it to the first route:
#   curl -sI -H 'x-test-host: docs.wasmcloud.com' http://127.0.0.1:8787/foo
# Restart this after every `make cf`: a dev server whose assets were rebuilt
# under it serves stale files.
cf-dev:
	$(WRANGLER) dev --local --port 8787 --var DEV_HOST_HEADER:1

cf-test:
	node --test worker/test/*.test.mjs

cf-deploy:
	$(WRANGLER) deploy
