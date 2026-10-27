# FlowGraph — harness 测试工作区 (test)

harness 为审计层：校验产品实现与契约/资源一致、资源合法、协议契约，并提供 demo mock 服务，**不参与产品构建**。

## 目录
- `../assets/` — 唯一权威资源源头（design-tokens/statemachine/strings/configs/testcases + schema）
- `parity-tests/` — 校验套件
  - `parity/` — 产品实现与契约/规范对称
  - `assets/` — 源头 schema 校验 + 各产品 vendored 副本漂移守门
  - `contracts/` — 协议契约样例
  - `_paths.py` — 统一路径解析锚点
- `mock-server/` — demo mock 服务（独立包）
- `sync/sync-assets.sh` — 单向下发：assets 源头 → 产品 vendored 副本

## 定位产品
默认产品与 `test`/`assets` 平级检出于 `projects/` 工作区下。异布局设环境变量：

    export WORKSPACE_ROOT=/path/to/projects

## 跑校验
parity-tests 依赖 `jsonschema`、`pytest`：

    cd projects/test
    pytest parity-tests/parity/ parity-tests/assets/ parity-tests/contracts/ -v

## 改资源工作流（务必遵守）
1. 编辑 `projects/assets/` 源头
2. `bash projects/test/sync/sync-assets.sh` 单向下发至产品 vendored 副本
3. 产品仓库提交 vendored 变更
4. 跑上述 parity-tests 校验，漂移守门须全绿
