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

### Diagram workflow

The wasmCloud docs use [Excalidraw](https://excalidraw.com/) for diagrams. Source `.excalidraw` files live in `versioned_docs/version-next/images/` alongside the exported PNGs.

#### wasmCloud brand colors

All diagrams should use the wasmCloud brand palette for consistency.

| Color  | Stroke    | Background |
|--------|-----------|------------|
| Green  | `#00bc8e` | `#e6f9f3`  |
| Blue   | `#005799` | `#e6f0f7`  |
| Navy   | `#002e5d` | `#e6ecf3`  |
| Purple | `#6741d9` | `#f0ecff`  |
| Gold   | `#d4a017` | `#fff8e6`  |
| Red    | `#e03131` | `#ffe6e6`  |
| Gray   | `#788591` | `#f3f4f6`  |
| Teal   | `#099268` | `#e0f5f0`  |

#### Editing existing diagrams

Two options:

1. **VS Code Excalidraw extension** - Install the [Excalidraw extension](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor) and open `.excalidraw` files directly in VS Code.
2. **excalidraw.com** - Open [excalidraw.com](https://excalidraw.com/) and drag-and-drop the `.excalidraw` file onto the canvas. Save by downloading the file back (hamburger menu > Save to disk).

#### Creating new diagrams with Claude Code

Use the `excalidraw-diagrams` skill to generate diagrams programmatically:

```
/excalidraw-diagrams Create a flowchart showing the component deployment pipeline
```

The skill uses the `excalidraw_generator.py` library (in `.claude/skills/excalidraw-diagrams/`) which provides `Diagram`, `Flowchart`, and `ArchitectureDiagram` classes. Reference the brand colors from `CLAUDE.md` when specifying colors in your prompt.

#### Exporting to PNG

Diagrams must be exported as **transparent PNGs at 3x scale** before committing.

#### Automated export (Playwright)

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

### Manual export (No Playwright)

If you don't want to install Playwright:

1. Open the `.excalidraw` file at [excalidraw.com](https://excalidraw.com/)
2. Select all elements (Ctrl+A / Cmd+A)
3. Open the export dialog (hamburger menu > Export image)
4. Toggle **Background** off
5. Set **Scale** to **3x**
6. Click **Copy to clipboard** or **Save as PNG**
