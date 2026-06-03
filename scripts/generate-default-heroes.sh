#!/usr/bin/env bash
#
# Generate the 8 default blog hero images via the Gemini CLI's nano-banana
# extension, then derive 4:3 + 1:1 WebP crops via the transformer.
#
# Prereqs:
#   1. Gemini CLI installed: https://geminicli.com/docs/get-started
#   2. nano-banana extension installed:
#        gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
#   3. A Google AI Studio API key (https://aistudio.google.com/apikey) —
#      AIza... shape, 39 chars. Export it BEFORE running this script:
#        export NANOBANANA_API_KEY="AIza..."
#      (Or GEMINI_API_KEY / GOOGLE_API_KEY — nano-banana accepts any of them.)
#
# Run from the wasmcloud.com repo root:
#   ./scripts/generate-default-heroes.sh
#
# Idempotent: re-running skips topics whose hero-16x9.png already exists.
# To force-regenerate a specific topic, delete its PNG first:
#   rm static/default-heroes/<topic>/hero-16x9.png
#
# After all 8 PNGs are in place, derives WebP variants (and crops) via
# scripts/transform-blog-images.mjs --defaults. The WebP variants are what
# blog posts reference for Article rich-result eligibility.
set -euo pipefail

# --- pre-flight ---
cd "$(dirname "$0")/.."

if [[ -z "${NANOBANANA_API_KEY:-}${GEMINI_API_KEY:-}${GOOGLE_API_KEY:-}" ]]; then
  cat <<EOF >&2
[generate-default-heroes] No nano-banana API key in environment.

Set one of NANOBANANA_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY to your
Google AI Studio API key (AIza... shape from https://aistudio.google.com/apikey),
then re-run this script.

Note: OAuth-style tokens (AQ.* shape, from Vertex AI / gcloud) are NOT
accepted by the nano-banana MCP. You need a real AI Studio API key.
EOF
  exit 2
fi

# Mirror to all three names so subprocess invocations always find one.
export NANOBANANA_API_KEY="${NANOBANANA_API_KEY:-${GEMINI_API_KEY:-${GOOGLE_API_KEY}}}"
export GEMINI_API_KEY="${GEMINI_API_KEY:-$NANOBANANA_API_KEY}"
export GOOGLE_API_KEY="${GOOGLE_API_KEY:-$NANOBANANA_API_KEY}"
export GEMINI_CLI_TRUST_WORKSPACE=true

if ! command -v gemini >/dev/null 2>&1; then
  echo "[generate-default-heroes] gemini CLI not found in PATH — install per https://geminicli.com/docs/get-started" >&2
  exit 2
fi

# --- prompts ---
# Topic slug → prompt. Bash 3.2 (default macOS) lacks associative arrays,
# so we use a delimited-string format.
PROMPTS=(
  "webassembly|Wide 16:9 banner image. Abstract visualization of WebAssembly bytecode as flowing modular blocks composing into a single integrated whole. Stack-based virtual machine metaphor — geometric tiles snapping together along typed interfaces. Centered composition. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "aiops|Wide 16:9 banner image. Neural network meets observability dashboard. Flowing data streams converging into a central insight node, with anomaly indicators and topology graphs in the background. Modern AI operations visualization. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "component-model|Wide 16:9 banner image. Interconnected modular components with visible typed interfaces between them — like blueprint-style schematic with clean connecting lines. Each block a distinct shape, connections explicit. Convey isolation plus composition. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "kubernetes|Wide 16:9 banner image. wasmCloud-on-Kubernetes topology — geometric pods orbiting a central runtime operator, with Wasm components rendered as smaller hexagonal tiles inside larger Kubernetes-styled containers. Convey integration not replacement. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "ai-mcp-agentic|Wide 16:9 banner image. Model Context Protocol sandbox visualization — an AI agent figure inside a glowing capability-bounded enclosure, with explicit permission tokens depicted as keys flowing in and out. Convey deny-by-default sandboxing of AI workloads. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "wasi|Wide 16:9 banner image. System-interface schematic — WebAssembly module at center with WASI APIs depicted as labeled abstract terminals fanning out: HTTP, filesystem, sockets, clocks. Clean blueprint look. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "community|Wide 16:9 banner image. Diverse community of contributor avatars arranged around a central wasmCloud logo, with code commit and pull-request iconography flowing between them. Convey collaborative open source development. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
  "generic|Wide 16:9 banner image. wasmCloud wordmark prominently centered against a Space Blue gradient background, with subtle Wasm component-tile pattern in the background at low opacity. Brand-anchored fallback hero. wasmCloud brand palette: primary Green Aqua #00C389, background Space Blue #002E5D, secondary Gunmetal #253746, accent Yellow #FFB600. Style: production blog hero, technical infographic style, clean geometric, flat illustration, no photorealism, no text overlay, abstract conceptual."
)

# --- generate ---
mkdir -p nanobanana-output
generated=0
skipped=0
failed=0

for entry in "${PROMPTS[@]}"; do
  slug="${entry%%|*}"
  prompt="${entry#*|}"
  outdir="static/default-heroes/$slug"
  outfile="$outdir/hero-16x9.png"

  if [[ -f "$outfile" ]]; then
    echo "[skip] $slug — $outfile already exists"
    ((skipped+=1)) || true
    continue
  fi

  mkdir -p "$outdir"
  echo "[generate] $slug …"
  log="/tmp/nb-$slug.log"
  if ! gemini --yolo --skip-trust "/generate '$prompt'" >"$log" 2>&1; then
    echo "  ✗ generation failed — see $log"
    ((failed+=1)) || true
    continue
  fi
  latest=$(ls -1t nanobanana-output/*.png 2>/dev/null | head -1 || true)
  if [[ -z "$latest" ]]; then
    echo "  ✗ no PNG produced — see $log"
    ((failed+=1)) || true
    continue
  fi
  cp "$latest" "$outfile"
  echo "  ✓ $outfile"
  ((generated+=1)) || true
done

echo
echo "[generate-default-heroes] summary: generated=$generated  skipped=$skipped  failed=$failed"

if [[ $failed -gt 0 ]]; then
  echo "[generate-default-heroes] some prompts failed — see /tmp/nb-<slug>.log files" >&2
fi

# --- derive WebP crops ---
if [[ -x "$(command -v node)" ]]; then
  echo
  echo "[generate-default-heroes] deriving WebP 16:9 + 4:3 + 1:1 crops …"
  node scripts/transform-blog-images.mjs --defaults
else
  echo "[generate-default-heroes] node not in PATH — run \`node scripts/transform-blog-images.mjs --defaults\` manually to derive WebP crops" >&2
fi

echo
echo "[generate-default-heroes] done. Outputs:"
ls -la static/default-heroes/*/hero-16x9.* 2>/dev/null || true
