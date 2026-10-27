## Context

flowGraph 是 Web 端轻量流程图编辑器（Vue 3 + Vite + TS，SVG 渲染）。项目采用 harness 方法：`projects/assets/` 为唯一权威资源源头（设计令牌 / 状态机 / 文案 / 配置 / 序列化 schema），`projects/test/` 为审计层（schema 校验 + 契约校验 + 漂移守门），产品（`projects/flowgraph-web/`）只读 vendored 副本、不参与 harness。约束：改资源必先改源头 → `sync-assets.sh` 单向下发 → harness 校验全绿。

## Goals / Non-Goals

**Goals:**
- 固化设计基准与资源源头，形成可校验的单一真相源。
- 建立 harness 校验闭环：资源 schema 合法、序列化契约成立、副本漂移可守门。
- 为后续产品实现提供稳定契约（数据模型、交互状态机、视觉令牌、配置枚举）。

**Non-Goals:**
- 不写产品代码（`projects/flowgraph-web/`）。
- 不引入多人协作、服务端存储、自动布局、语义校验等（PRD §5 非目标）。
- 不引入 JSON Schema 运行时校验器（前端）；graph.schema.json 仅作 harness/契约真相源，前端用 TS 类型守卫。

## Decisions

- **渲染用 SVG 而非 Canvas**：命中检测、DOM 事件、SVG/PNG 导出天然契合。备选 Canvas 否决——命中检测与导出成本高。
- **undo/redo 用命令模式**：所有结构变更走 command（`do`/`undo`），拖动仅结束时入栈。备选快照模式（全量 diff）否决——内存与粒度不可控。
- **资源单一源头 + vendored 副本 + 漂移守门**：与参考 harness（aidp-update-hws）一致；`sync-assets.sh` 排除 `*.schema.json`（schema 仅源头持有）。
- **序列化契约用 JSON Schema（draft-07）**：`graph.schema.json` 定义 node/edge/viewport 与 `NodeShape`/`EdgeType` 枚举；`configs/editor.json` 定义形状/尺寸/缩放/网格配置。
- **交互用状态机驱动**：`statemachine.json` 定义 6 状态（idle/selecting/moving-selection/connecting/panning/editing-label）与转移，交互层据此派发命令。

## Risks / Trade-offs

- [产品未实现，契约可能过设计] → 设计以 MVP 为准，仅固化 8 项能力；后续 change 可 MODIFIED 演进 spec。
- [graph.schema.json 是否需前端运行时校验] → 前端用 TS 类型守卫，暂不引入 ajv；如未来需运行时严格校验再议。
- [漂移守门在无产品时 skip] → 设计为「vendored 不存在则 skip」，产品 sync 后自动转硬守门，避免设计期红灯。
- [形状/配置枚举变更会破坏契约] → 枚举集中在 `configs/editor.json` 与 `graph.schema.json`，改枚举即改源头 + harness 校验，防单点散落。

## 现状（apply 前已就绪）

- `01PRD` / `02Design` 已落地；`projects/assets/*` 已落地；`projects/test/parity-tests/{assets,contracts}` 已落地并通过（16 passed, 1 skipped）。
