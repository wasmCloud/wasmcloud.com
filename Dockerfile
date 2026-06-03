# Air-gapped wasmCloud docs image. Builds the docs site with external
# integrations disabled (OFFLINE_BUILD=1 — see docusaurus.config.ts) and
# serves it from nginx:alpine. Published to ghcr.io/wasmcloud/docs:X.Y.Z
# when a `docs-v*` tag is pushed; see .github/workflows/release-docs.yml.
#
# Build:
#   docker build -t wasmcloud-docs:test .

# --- Stage 1: build the static site -------------------------------------------
FROM node:24-alpine AS build

WORKDIR /repo

# Copy dependency manifests first so the `npm ci` layer is reused across
# doc-content-only rebuilds. Any change to package*.json busts the cache.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV OFFLINE_BUILD=1
RUN npm run build

# --- Stage 2: serve via nginx -------------------------------------------------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/build /usr/share/nginx/html

EXPOSE 80
