# FlowGraph · 项目地图（人工入口）

> 本文件是面向**开发人员的项目地图（人工入口）**，与 [`CLAUDE.md`](CLAUDE.md)（Agent 视角，最高优先级指令）**内容对齐、受众不同**。

## 1. 项目定位

FlowGraph 前端项目的工作区。本仓库承载跨端协同基线、开放规范（OpenSpec）与团队知识库，并内含 **harness 审计层**（`projects/test/` + `projects/assets/`）；产品代码位于 `projects/` 下（各子项目可独立成仓库）。

## 2. harness 定位

**harness = 审计/校验层**：持有唯一权威资源源头，校验「产品实现 ↔ 契约/资源」的一致性、资源合法性、协议契约，并提供 demo mock 服务，**不参与产品构建**。

## 3. 目录地图

```
flowGraph/
├── CLAUDE.md          # 项目地图（Agent 视角，最高优先级指令）
├── README.md          # 项目地图（人工入口）
├── openspec/          # 开放规范：changes/（提案/归档）
├── projects/          # 工作区
│   ├── test/          # harness 审计层：parity-tests/ + mock-server/ + sync/
│   ├── assets/        # 唯一权威资源源头（design-tokens / statemachine / strings / configs / testcases）
│   └── docs/          # 设计/校验体系文档（01PRD ~ 06Release）
├── superpowers/       # plans/（实施计划）+ specs/（设计）
└── team-knowledge/    # 团队知识库：team-biz-wiki/ + team-tech-wiki/
```

## 4. 关键命令

```bash
# harness 校验（一致性 / 资源合法 / 契约）
cd projects/test && pytest parity-tests/parity/ parity-tests/assets/ parity-tests/contracts/ -v

# 单向下发资源源头 → 产品 vendored 副本
bash projects/test/sync/sync-assets.sh
```

## 5. 改资源工作流

1. 编辑 `projects/assets/` 源头
2. `bash projects/test/sync/sync-assets.sh` 单向下发
3. 产品仓库提交 vendored 变更
4. 跑 harness 校验，漂移守门须全绿
