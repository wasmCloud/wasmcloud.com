[![Netlify Status](https://api.netlify.com/api/v1/badges/bbca7efa-bdeb-49d8-86cd-3fcb6dcea34f/deploy-status)](https://app.netlify.com/sites/dreamy-golick-5f201e/deploys)
# wasmCloud.com
Repository for the wasmCloud homepage including our community, team, links, and as an ingress point for interested developers. This site is built with [Hugo](https://gohugo.io/) and uses the [copper-hugo](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/themes/copper-hugo) theme. 

## Running the site locally
Ensure you have the [hugo CLI](https://gohugo.io/getting-started/installing/) installed. Once you have the binary installed you can simply run `hugo serve -D` and access the local site in your browser at http://localhost:1313.

## Important files / folders

- [content/english](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/content/english) contains all of our content for the site like about, blogs, documentation, etc. Some of the pages in here are not enabled on the site
- [data/en/homepage.yml](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/data/en) contains the homepage data for the first landing page
- The main scss file for website styles is located under the [resources](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/resources/_gen/assets/scss/scss) folder
- All [static](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/static) assets are served from that folder including any images needed for [blogs](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/static/images/blogs)
- The [copper-hugo](https://github.com/wasmCloud/wasmcloud.com-dev/tree/main/themes/copper-hugo) directory includes theme information