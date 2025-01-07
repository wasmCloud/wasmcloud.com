#!/usr/bin/env bash

set -euo pipefail

# If no arguments are passed, print help message and exit
if [ $# -eq 0 ]; then
    echo "Usage: $0 <go_repo_path>"
    exit 1
fi

go_repo=$1

# Get the top-level directory of the repository
pushd "${go_repo}";
    docs_dir="$(git rev-parse --show-toplevel)/examples";
popd;

while IFS= read -r -d '' file
do
    # Get the relative path of the file from the repo root
    rel_path=$(dirname "${file#"$docs_dir/"}")
    # This uppercases the first letter of each word in the path so the sidebar is correct. We may
    # change this in the future with some metadata in the docs repo
    target_dir="$(git rev-parse --show-toplevel)/docs/Examples/Go/${rel_path^}"
    # Create the target directory structure
    mkdir -p "${target_dir}"
    # Copy the file to the docs repo
    cp "$file" "${target_dir}/index.md"
done <  <(find "${docs_dir}" -name "README.md" -type f -print0)

# Now check if there are any git changes in the repo
if [[ -z "$(git status --porcelain)" ]]; then
    echo "No changes detected in docs repo. Exiting..."
    exit 0
fi

echo "Changes detected in docs repo after syncing"
# If GITHUB_OUTPUT is set, write a variable to it. This is mostly here so people can run it locally
# if desired and for testing.
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "docs_changed=true" >> "$GITHUB_OUTPUT"
fi
exit 0
