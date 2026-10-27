# FlowGraph — 设计基准 (02Design)

> 版本：v0.1 · 状态：草案（与 01PRD 同步评审）

## 1. 架构总览

```
┌──────────────────────────────────────────────────────┐
│  ui (Vue 组件层)                                       │
│   EditorCanvas · Toolbar · Inspector · ExportBar       │
├──────────────────────────────────────────────────────┤
│  interaction (交互层)                                  │
│   state machine 驱动 · pointer/keyboard 事件绑定        │
├──────────────────────────────────────────────────────┤
│  render (渲染层，SVG)                                  │
│   NodeRenderer · EdgeRenderer · GridRenderer           │
├──────────────────────────────────────────────────────┤
│  core (核心层，纯 TS，无 DOM，可单测)                    │
│   model (Graph/Node/Edge) · commands (undo/redo)        │
│   serialization (JSON + schema) · selection/viewport    │
├──────────────────────────────────────────────────────┤
│  export (导出层)                                       │
│   toSVG · toPNG                                        │
└──────────────────────────────────────────────────────┘
        ▲ 所有层只读 assets 源头（vendored 副本），禁止硬编码
```

**分层铁律**：上层可依赖下层，禁止反向；渲染层/交互层只读 model，**所有 model 变更必须经 command**（保证 undo/redo 一致）。

## 2. 数据模型

```ts
type NodeShape = 'rect' | 'rounded' | 'diamond' | 'ellipse'
type EdgeType  = 'line' | 'curve' | 'orthogonal'

interface Viewport { x: number; y: number; zoom: number }

interface Node {
  id: string
  type: NodeShape
  label: string
  x: number; y: number          // 左上角（世界坐标）
  width: number; height: number
}

interface Edge {
  id: string
  source: string                // 源节点 id
  target: string                // 目标节点 id
  type?: EdgeType               // 默认 line
  label?: string
}

interface Graph {
  version: 1                    // 序列化版本，用于向后兼容
  nodes: Node[]
  edges: Edge[]
  viewport: Viewport
}
```

序列化遵循 `assets/graph.schema.json`（单一源头）；`NodeShape`/`EdgeType` 枚举由 `assets/configs/editor.json` 定义。

## 3. 交互状态机

状态（editor mode）：

| 状态 | 含义 | 进入条件 |
|------|------|---------|
| `idle` | 空闲，悬停高亮 | 默认 / 操作结束 |
| `selecting` | 框选（拖空白） | idle + pointerdown(空白) + 拖拽 |
| `moving-selection` | 拖动选中项 | idle + pointerdown(节点/选区) + 拖拽 |
| `connecting` | 拖出连线 | idle + pointerdown(锚点) + 拖拽 |
| `panning` | 平移画布 | 空格/中键 或 idle + pointerdown(空白, 空手) |
| `editing-label` | 编辑节点文本 | idle + dblclick(节点) |

转移规则与守卫、退出动作统一编码进 `assets/statemachine.json`，交互层据此派发命令。

## 4. 命令模式（undo/redo）

所有结构变更封装为命令，含 `do()` / `undo()`：

- `AddNodeCommand` / `RemoveNodeCommand`（级联删边）
- `MoveNodesCommand`（批量移动，含拖动结束的净位移）
- `UpdateNodeLabelCommand` / `UpdateNodeShapeCommand`
- `AddEdgeCommand` / `RemoveEdgeCommand`
- `PasteCommand`（粘贴即批量 Add，合成单个命令）

约束：`MoveNodesCommand` 只在拖动结束时入栈（拖动过程只改临时位置），避免每帧污染历史。

## 5. 渲染（SVG）

- 单一 `<svg>` 承载全部图形；内容用 `<g transform>` 应用 viewport（平移 + 缩放）。
- 网格为可选图层，间距按 zoom 分档（见 configs）。
- 命中检测：SVG 元素原生事件（节点/边/锚点），空白区由 svg 背景事件承接。
- 渲染 = model 的纯投影；渲染层**不写 model**。

## 6. 序列化 / 导出

- `serialization.toJSON(graph)` / `fromJSON(json)`，`fromJSON` 前经 `graph.schema.json` 校验（非法即拒绝）。
- `export.toSVG` 直接序列化当前渲染的 svg；`export.toPNG` 由 SVG 光栅化（canvas 绘制）。

## 7. 目录结构（产品 `projects/flowgraph-web/`）

```
flowgraph-web/
├── src/
│   ├── core/
│   │   ├── model/          # graph/node/edge 类型 + 工厂
│   │   ├── commands/       # 命令实现 + history stack
│   │   ├── serialization/  # toJSON/fromJSON + schema 校验
│   │   └── statemachine/   # 交互状态机（读 assets/statemachine）
│   ├── render/             # node/edge/grid 渲染（SVG）
│   ├── interaction/        # 指针/键盘事件 → 状态机 → 命令
│   ├── export/             # toSVG / toPNG
│   ├── components/         # EditorCanvas / Toolbar / Inspector
│   └── assets/             # vendored 副本（由 sync-assets.sh 下发，只读）
├── index.html · package.json · vite.config.ts
```

## 8. 关键设计决策（已定）

| 决策 | 选择 | 理由 |
|------|------|------|
| 渲染 | SVG（非 Canvas） | 命中检测、DOM 事件、SVG 导出天然契合 |
| 状态 | Composable + reactive model（暂不引 Pinia） | MVP 轻量，避免过早抽象 |
| undo/redo | 命令模式 | 可逆、可测、易扩展 |
| 资源 | 全部读 assets 源头 vendored 副本 | 单一真理源头，harness 漂移守门 |
| 坐标 | 世界坐标 + viewport 变换 | 缩放/平移/导出统一 |
