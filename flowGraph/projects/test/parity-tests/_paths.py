"""harness 统一路径解析。所有测试经此取锚点，杜绝散落的 parents[N] 与 CWD 相对路径。"""
import os
import pathlib

# _paths.py 位于 projects/test/parity-tests/ → parents[3] = flowGraph 仓库根
REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]
ASSETS_SRC = REPO_ROOT / "projects" / "assets"  # 唯一权威资源源头

# 产品工作区根（默认 = projects/；CI 异布局用 WORKSPACE_ROOT 覆盖）
WORKSPACE_ROOT = pathlib.Path(
    os.environ.get("WORKSPACE_ROOT", REPO_ROOT / "projects")
).resolve()

# 被测产品（前端）路径锚点 —— 按实际布局补充
WEB_DIR = WORKSPACE_ROOT / "flowgraph-web"

# 产品 vendored 副本落点（漂移检查用）—— 按实际布局补充
VENDORED = {
    "web": WEB_DIR / "src" / "assets",
}
