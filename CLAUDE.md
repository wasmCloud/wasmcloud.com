# CLAUDE.md

## Diagrams

This project uses [Excalidraw](https://excalidraw.com/) for diagrams. Source files (`.excalidraw`) are stored alongside docs in `versioned_docs/version-next/images/` and exported as transparent PNGs at 3x scale.

### wasmCloud Brand Color Palette

Use these colors for diagram elements (stroke / background):

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

### Creating Diagrams with Claude Code

Use the `excalidraw-diagrams` skill (`/excalidraw-diagrams`) to generate diagrams programmatically with the brand palette above.

### Exporting to PNG

```bash
cd scripts && npm install && npx playwright install chromium
node export-excalidraw-png.js <input.excalidraw> [output.png]
```

See [docs/diagrams.md](docs/diagrams.md) for the full contributor workflow.
