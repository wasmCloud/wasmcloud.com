// wasmcloud-slack: slack.wasmcloud.com.
//
// One page that forwards to the wasmCloud Slack invite, as the Netlify
// project behind slack.wasmcloud.com served it until 2026-11-19. /slack on
// wasmcloud.com redirects here (netlify.toml), so the invite link lives in
// one place: to change it, edit src/index.html and deploy.
//
// What it keeps from Netlify: the page at / and /index.html, with the same
// meta refresh to the invite; plain http to https; a 404 for every other
// path. The page itself has since gained what a crawler expects of a
// subdomain's home page (lang, description, canonical, social tags, an h1
// and the wasmCloud Organization JSON-LD, which mirrors the node in
// docusaurus.config.ts): site audits read it as one.

import page from './index.html';

const HEADERS = {
  'cache-control': 'public,max-age=0,must-revalidate',
  'strict-transport-security': 'max-age=31536000',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // `wrangler dev` is http only and reports the route's hostname, so local
    // runs say so: npx wrangler dev --local --var DEV:1
    const local = Boolean(env.DEV) || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
    if (url.protocol === 'http:' && !local) {
      const location = `https://${url.host}${url.pathname}${url.search}`;
      return new Response(`Redirecting to ${location}`, {
        status: 301,
        headers: { location, 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    const path = url.pathname.replace(/\/{2,}/g, '/');
    if (path === '/' || path === '/index.html') {
      return new Response(request.method === 'HEAD' ? null : page, {
        headers: { ...HEADERS, 'content-type': 'text/html; charset=UTF-8' },
      });
    }
    return new Response(
      '<!DOCTYPE html><html><head><title>Page not found</title></head><body>'
      + '<p>Page not found. The wasmCloud Slack invite is at '
      + '<a href="https://slack.wasmcloud.com/">slack.wasmcloud.com</a>.</p></body></html>\n',
      { status: 404, headers: { ...HEADERS, 'content-type': 'text/html; charset=utf-8' } });
  },
};
