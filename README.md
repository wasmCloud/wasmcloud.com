[![Netlify Status](https://api.netlify.com/api/v1/badges/bbca7efa-bdeb-49d8-86cd-3fcb6dcea34f/deploy-status)](https://app.netlify.com/sites/dreamy-golick-5f201e/deploys)

# wasmCloud.com

Repository for the wasmCloud homepage including our community, team, docs, links, and as an ingress point for interested developers. This site is built with [Docusaurus](https://docusaurus.io/).

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

### Diagram workflow

The wasmCloud docs use [Excalidraw](https://excalidraw.com/) for diagrams. Source `.excalidraw` files live in `versioned_docs/version-next/images/` alongside the exported PNGs.

#### Brand colors and the wasmCloud Excalidraw library

Colors, typography, and the official wasmCloud Excalidraw library are defined in the [`brand-guidelines` skill](https://github.com/cosmonic-labs/skills/tree/main/brand-guidelines). The skill is open source and donated by Cosmonic — for this repository, use the **wasmCloud** sections.

The wasmCloud palette in brief:

| Color       | Hex       | Use                                |
|-------------|-----------|-------------------------------------|
| Green Aqua  | `#00C389` | Primary brand color, main elements |
| Space Blue  | `#002E5D` | Dark backgrounds, outlines         |
| Gunmetal    | `#253746` | Text, secondary backgrounds        |
| Light Gray  | `#768692` | Secondary text                     |
| Gainsboro   | `#D9E1E2` | Light backgrounds, borders         |
| Yellow      | `#FFB600` | Highlights, CTAs                   |

The `brand-guidelines` skill is the canonical source; defer to it when the palette here conflicts with the skill content.

To load the [wasmCloud and Wasm Excalidraw library](https://excalidraw.com/?addLibrary=https%3A%2F%2Fraw.githubusercontent.com%2Fexcalidraw%2Fexcalidraw-libraries%2Fricochet-wasmcloud-and-wasm-1770917744834%2Flibraries%2Fricochet%2Fwasmcloud-and-wasm.excalidrawlib%3Fraw%3Dtrue) in the Excalidraw web UI, click the link and confirm the library install.

#### Installing the brand-guidelines skill locally

The skill ships as a project-level Claude Code skill, pinned in `skills-lock.json`. To install or restore it on a fresh checkout:

```bash
npx skills experimental_install
```

If you prefer to add the skill manually (or to a different agent):

```bash
npx skills add cosmonic-labs/skills --skill brand-guidelines --agent claude-code
```

The installed skill content is gitignored; only `skills-lock.json` is committed.

#### Editing existing diagrams

Two options:

1. **VS Code Excalidraw extension** — install the [Excalidraw extension](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor) and open `.excalidraw` files directly in VS Code.
2. **excalidraw.com** — open [excalidraw.com](https://excalidraw.com/) and drag-and-drop the `.excalidraw` file onto the canvas. Save by downloading the file back (hamburger menu > Save to disk).

#### Creating new diagrams with Claude Code

With the `brand-guidelines` skill installed, ask Claude Code to create a diagram and the skill will surface the wasmCloud palette, typography, and Excalidraw library to use. For example:

```
Create an Excalidraw flowchart showing the component deployment pipeline, using the brand-guidelines skill.
```

#### Exporting to PNG

Diagrams must be exported as **transparent PNGs at 3x scale** before committing.

##### Automated export (Playwright)

One-time setup:

```bash
cd scripts
npm install
npx playwright install chromium
```

Export a diagram:

```bash
node export-excalidraw-png.js <input.excalidraw> [output.png]
```

If no output path is given, the PNG is written next to the `.excalidraw` file with the same name.

##### Manual export (no Playwright)

If you don't want to install Playwright:

1. Open the `.excalidraw` file at [excalidraw.com](https://excalidraw.com/)
2. Select all elements (Ctrl+A / Cmd+A)
3. Open the export dialog (hamburger menu > Export image)
4. Toggle **Background** off
5. Set **Scale** to **3x**
6. Click **Copy to clipboard** or **Save as PNG**
