#!/usr/bin/env bash
# 单向下发：projects/assets 源头 → 产品 vendored 副本（全量镜像，幂等）。
# 禁止反向。改资源必先改 projects/assets，再跑此脚本。
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # projects/test/sync
REPO_ROOT="$(cd "$HERE/../.." && pwd)"                  # flowGraph/
SRC="$REPO_ROOT/projects/assets"
WS="${WORKSPACE_ROOT:-$REPO_ROOT/projects}"             # 产品工作区根

# 被测产品 vendored 副本落点（按实际布局补充/修改）
WEB_DST="$WS/flowgraph-web/src/assets"

sync_one() {
  local dst="$1"
  rm -rf "$dst"
  mkdir -p "$dst"
  # 全量镜像源头（排除 *.schema.json：副本只需运行时数据，schema 仅源头校验用）
  rsync -a --exclude='*.schema.json' --exclude='.DS_Store' "$SRC/" "$dst/"
  echo "  synced → $dst"
}

echo "[sync-assets] SRC=$SRC"
[ -d "$SRC" ] || { echo "源头不存在: $SRC" >&2; exit 1; }
echo "web:"; sync_one "$WEB_DST"
echo "[sync-assets] done."
