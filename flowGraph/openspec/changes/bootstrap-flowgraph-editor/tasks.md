## 1. 设计基准

- [x] 1.1 写 `projects/docs/01PRD/PRD.md`：定位 + MVP 8 项 + 非目标 + 验收
- [x] 1.2 写 `projects/docs/02Design/DESIGN.md`：分层 / 数据模型 / 状态机 / 命令模式 / 关键决策

## 2. 权威资源源头（projects/assets/）

- [x] 2.1 `graph.schema.json`：序列化契约（node/edge/viewport，`version` 锁 1）
- [x] 2.2 `statemachine.json` + schema：6 交互状态 + 转移 + guards
- [x] 2.3 `design-tokens.json` + schema：颜色 / 描边 / 圆角 / 间距 / 字体
- [x] 2.4 `strings.zh_CN.json` + schema：工具栏 / 节点 / 空态文案
- [x] 2.5 `configs/editor.json` + `configs.schema.json`：形状 / 默认尺寸 / 缩放 / 网格 / 吸附

## 3. harness 校验（projects/test/）

- [x] 3.1 `parity-tests/assets/`：5 类源头 schema 校验 + 状态机语义校验 + 漂移守门
- [x] 3.2 `parity-tests/contracts/`：`graph.example.json` + 契约测试（合法通过 / 非法拒绝）
- [x] 3.3 `_paths.py` 统一路径锚点（`parents[3]` 修正）
- [x] 3.4 `sync/sync-assets.sh` 单向下发脚本 + `requirements.txt`
- [x] 3.5 跑通 `pytest parity-tests/parity/ assets/ contracts/ -v`（16 passed, 1 skipped）

## 4. 待办（本 change 不做，后续 change 承接）

- [ ] 4.1 建立 `projects/flowgraph-web/` 产品工程（Vue 3 + Vite + TS）
- [ ] 4.2 产品接入 vendored 副本 + `sync-assets.sh` 首次下发
- [ ] 4.3 `parity/` 落地「产品实现 ↔ 契约」一致性校验（待产品代码存在）
- [ ] 4.4 产品 MVP 8 项能力实现 + 验收（对照 PRD §7）
