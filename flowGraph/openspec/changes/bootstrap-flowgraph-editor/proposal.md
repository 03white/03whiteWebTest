## Why

flowGraph 前端流程图编辑器从零起步。为遵守项目「设计优先 + 单一真相源 + 验证闭环」的强约束，需先固化三件事：**设计基准**（PRD / Design）、**权威资源源头**（graph schema / statemachine / design-tokens / strings / configs）、**校验 harness**（schema / 契约 / 漂移三重守门）。三者已初步落地，本提案将其正式化，作为后续产品实现（`projects/flowgraph-web/`）的契约基础。

## What Changes

- 新增 `projects/docs/01PRD/PRD.md`：定位、MVP 8 项能力、非目标、验收标准。
- 新增 `projects/docs/02Design/DESIGN.md`：架构分层、数据模型、交互状态机、命令模式、关键决策。
- 新增权威资源源头 `projects/assets/`：`graph.schema.json`、`statemachine.json`、`design-tokens.json`、`strings.zh_CN.json`、`configs/editor.json`（各配 schema）。
- 新增 harness 校验 `projects/test/parity-tests/{assets,contracts}` + `sync/sync-assets.sh`，实现对源头与契约的守门。
- **无产品代码**：`projects/flowgraph-web/` 留待后续 change 实现，本提案只交付契约与校验。

## Capabilities

### New Capabilities

- `flowgraph-editor`: 流程图编辑器核心规范——画布缩放/平移、节点增删改拖与多形状、连线、序列化/反序列化、撤销/重做、多选/复制粘贴、导出图片，以及资源单一源头与 harness 校验要求。

### Modified Capabilities

<!-- 无：openspec/specs/ 当前为空，无既有能力规范可修改 -->

## Impact

- **主要更新对象**：`projects/docs/01PRD/`、`projects/docs/02Design/`、`projects/assets/`、`projects/test/`
- **真相源物料**：`projects/assets/*`（唯一权威），产品 vendored 副本由 `sync-assets.sh` 单向下发
- **无代码 / API 变更**：纯设计 + 资源 + 校验，不改动既有产品代码（尚无产品代码）
