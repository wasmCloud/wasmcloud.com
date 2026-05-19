# CLAUDE.md

## Diagrams

This project uses [Excalidraw](https://excalidraw.com/) for diagrams. Source files (`.excalidraw`) are stored alongside docs in `versioned_docs/version-next/images/` and exported as transparent PNGs at 3x scale.

### Brand guidelines skill

Colors, typography, and the official wasmCloud Excalidraw library are defined in the `brand-guidelines` skill (managed via `skills-lock.json`; see [README.md](README.md#diagram-workflow) for setup). The skill covers both Cosmonic and wasmCloud brands — for this repository, follow the **wasmCloud** sections.

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

### Creating diagrams

Load the [wasmCloud and Wasm Excalidraw library](https://excalidraw.com/?addLibrary=https%3A%2F%2Fraw.githubusercontent.com%2Fexcalidraw%2Fexcalidraw-libraries%2Fricochet-wasmcloud-and-wasm-1770917744834%2Flibraries%2Fricochet%2Fwasmcloud-and-wasm.excalidrawlib%3Fraw%3Dtrue) and apply the wasmCloud palette. The `brand-guidelines` skill has more detailed guidance for diagrams created with the Excalidraw MCP server.

### Exporting to PNG

```bash
cd scripts && npm install && npx playwright install chromium
node export-excalidraw-png.js <input.excalidraw> [output.png]
```

See [README.md](README.md#diagram-workflow) for the full contributor workflow.
