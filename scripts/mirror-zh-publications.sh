#!/usr/bin/env bash
# Papers, talks and projects added in Pages CMS only have index.md. Hugo shows a page in Chinese
# only when index.zh.md exists, so at build time copy index.md for entries without a translation.
# Run before `hugo` in CI; the copies are not committed.
set -euo pipefail
cd "$(dirname "$0")/.."
for dir in content/publications/*/ content/talks/*/ content/projects/*/; do
  if [ -f "${dir}index.md" ] && [ ! -f "${dir}index.zh.md" ]; then
    cp "${dir}index.md" "${dir}index.zh.md"
    echo "mirrored ${dir}index.md -> index.zh.md"
  fi
done
