#!/usr/bin/env -S just --justfile
# ^ A shebang isn't required, but allows a justfile to be executed
#   like a script, with `./justfile test`, for example.

# Lint markdown files. Uses .markdownlintignore to ignore irrelevant files.
lint-docs:
    markdownlint --disable MD013 -- "**/*.md" "**/*.mdx"

# Lint and fix our markdown files. Uses .markdownlintignore to ignore irrelevant files.
fix-docs:
    markdownlint --fix "**/*.md" "**/*.mdx"
