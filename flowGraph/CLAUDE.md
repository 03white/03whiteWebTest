# FlowGraph · 项目地图（Agent 视角）

> 本文档是 **AI(Agent) 的项目地图，亦为本项目最高优先级指令**，与 [`README.md`](README.md)（人工入口）内容对齐、受众不同。

## 1. 项目定位

FlowGraph 前端项目工作区。本仓库承载开放规范（OpenSpec）与团队知识库，并内含 **harness 审计层**；产品代码位于 `projects/` 下。

## 2. harness 定位

**harness = 审计/校验层**：持有唯一权威资源源头，校验一致性（parity）、资源合法（schema）、协议契约（contracts）、副本漂移（drift），并提供 demo mock 服务，**不参与产品构建**。

## 3. 目录地图

```
flowGraph/
├── CLAUDE.md          # 项目地图（Agent 视角，最高优先级指令）
├── README.md          # 项目地图（人工入口）
├── openspec/          # 开放规范：changes/（提案/归档）
├── projects/          # 工作区
│   ├── test/          # harness 审计层：parity-tests/{parity,assets,contracts} + mock-server/ + sync/
│   ├── assets/        # 唯一权威资源源头（design-tokens/statemachine/strings/configs/testcases + schema）
│   └── docs/          # 01PRD ~ 06Release
├── superpowers/       # plans/ + specs/
└── team-knowledge/    # team-biz-wiki/ + team-tech-wiki/
```

## 4. 强约束

1. **单一源头**：改资源必先改 `projects/assets/` 源头，再 `sync-assets.sh` 单向下发，禁止直接改产品 vendored 副本。
2. **审计只读**：harness 持源头、跑校验，绝不被产品构建引用。
3. **验证闭环**：资源/契约/接口变更后必须跑 harness 校验（parity / assets / contracts），漂移守门须全绿。

## 5. 关键命令

```bash
# harness 校验
cd projects/test && pytest parity-tests/parity/ parity-tests/assets/ parity-tests/contracts/ -v
# 单向下发
bash projects/test/sync/sync-assets.sh
```
