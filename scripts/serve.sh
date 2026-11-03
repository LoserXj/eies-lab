#!/bin/bash
# Dev server that restarts itself: Hugo 0.162 sometimes panics on reload when content changes.
cd "$(dirname "$0")/.." || exit 1
export PATH="$HOME/.local/go/bin:$HOME/.local/bin:$PATH"
node scripts/build-zh.mjs  # Chinese pages; rerun after editing *_zh fields
while true; do
  hugo server --port 1313 "$@"
  echo "[serve.sh] hugo exited ($?), restarting in 1s..." >&2
  sleep 1
done
