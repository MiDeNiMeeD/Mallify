#!/usr/bin/env bash
# Sync the canonical chat module into each app's src/chat folder.
set -e
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SRC/../../.." && pwd)"

echo "Syncing chat module from $SRC"

targets=(
  "$ROOT/web/admin/src/chat"
  "$ROOT/web/manager/store/src/chat"
  "$ROOT/web/store/src/chat"
)

for t in "${targets[@]}"; do
  echo "  -> $t"
  rm -rf "$t"
  mkdir -p "$t"
  rsync -a --exclude 'sync.cmd' --exclude 'sync.sh' --exclude 'README.md' "$SRC"/ "$t"/ 2>/dev/null || cp -r "$SRC"/. "$t"/
  rm -f "$t/sync.cmd" "$t/sync.sh" "$t/README.md"
done

echo "Done."
