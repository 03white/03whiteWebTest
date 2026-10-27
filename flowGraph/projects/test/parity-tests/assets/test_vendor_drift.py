"""漂移守门：各产品 vendored 副本必须逐文件等于 assets 源头（排除 *.schema.json）。

产品尚未 sync（vendored 目录不存在）时 skip；一旦存在则强制一致，任一端缺文件或
内容不一致 → 测试失败，提示先改源头再跑 sync-assets.sh。
"""
import hashlib
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _paths import ASSETS_SRC, VENDORED  # noqa: E402


def _digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def _source_files():
    # 运行时数据文件（副本应含），排除仅源头持有的 schema
    return sorted(
        p for p in ASSETS_SRC.rglob("*.json")
        if not p.name.endswith(".schema.json")
    )


@pytest.mark.parametrize("end", sorted(VENDORED.keys()))
def test_vendor_copy_matches_source(end):
    dst_root = VENDORED[end]
    if not dst_root.exists():
        pytest.skip(
            f"[{end}] vendored 目录不存在（产品尚未 sync）: {dst_root}\n"
            "产品就绪后：改 assets 源头 → bash projects/test/sync/sync-assets.sh"
        )
    mismatches = []
    for src in _source_files():
        rel = src.relative_to(ASSETS_SRC)
        dst = dst_root / rel
        if not dst.exists():
            mismatches.append(f"缺失: {rel}")
        elif _digest(src) != _digest(dst):
            mismatches.append(f"内容漂移: {rel}")
    assert not mismatches, (
        f"[{end}] vendored 副本与源头不一致：\n  " + "\n  ".join(mismatches)
        + "\n请勿直接改副本；改 assets 源头后跑 sync-assets.sh 重新下发。"
    )
