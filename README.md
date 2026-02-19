[![Netlify Status](https://api.netlify.com/api/v1/badges/bbca7efa-bdeb-49d8-86cd-3fcb6dcea34f/deploy-status)](https://app.netlify.com/sites/dreamy-golick-5f201e/deploys)

# wasmCloud.com

Repository for the wasmCloud homepage including our community, team, docs, links, and as an ingress point for interested developers. This site is built with [Docusarus](https://docusaurus.io/).

## Running the site locally

```bash
npm ci
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

#### Serving static content

To serve the generated static content:

```bash
npm run serve
```
