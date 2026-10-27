import { reactive, ref, computed } from 'vue'
import type { Graph, GraphNode, GraphEdge, NodeShape, Point } from './model/types'
import { createGraph, createNode, createEdge, uid } from './model/graph'
import { History } from './commands/history'
import {
  AddNodesCommand,
  RemoveNodesCommand,
  MoveNodesCommand,
  UpdateNodeLabelCommand,
  AddEdgesCommand,
  RemoveEdgesCommand,
  CompositeCommand,
  type Command,
} from './commands/commands'
import { StateMachine, type SMDefinition } from './statemachine/statemachine'
import { toJSON, fromJSON } from './serialization/serialize'
import { editorConfig, statemachine } from './resources'
import { buildSvgString, svgToPngBlob, downloadBlob } from '../export/export'
import type { Anchor } from '../render/geometry'

export type PointerTarget =
  | { kind: 'empty' }
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string }
  | { kind: 'anchor'; id: string; anchor: Anchor }

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export function useGraphEditor() {
  const graph = reactive<Graph>(createGraph())
  const history = reactive(new History())
  const fsm = new StateMachine(statemachine as unknown as SMDefinition)

  const canUndo = computed(() => history.canUndo)
  const canRedo = computed(() => history.canRedo)

  const selectedNodes = ref<Set<string>>(new Set())
  const selectedEdges = ref<Set<string>>(new Set())

  const boxStart = ref<Point | null>(null)
  const boxCurrent = ref<Point | null>(null)
  const dragStartWorld = ref<Point | null>(null)
  const dragStartPos = new Map<string, Point>()
  const connectSource = ref<string | null>(null)
  const connectAnchor = ref<Anchor | null>(null)
  const tempEnd = ref<Point | null>(null)
  const panStart = ref<{ screen: Point; x: number; y: number } | null>(null)
  const editingId = ref<string | null>(null)

  let clipboard: { nodes: GraphNode[]; edges: GraphEdge[] } | null = null
  let editingPrev = ''

  const mode = computed(() => fsm.current)

  function nodeById(id: string): GraphNode | undefined {
    return graph.nodes.find((n) => n.id === id)
  }

  function nodeAt(p: Point): GraphNode | undefined {
    return graph.nodes.find(
      (n) => p.x >= n.x && p.x <= n.x + n.width && p.y >= n.y && p.y <= n.y + n.height,
    )
  }

  // ---- selection ----
  function selectOnly(ids: string[]): void {
    selectedNodes.value = new Set(ids)
    selectedEdges.value = new Set()
  }

  function clearSelection(): void {
    selectedNodes.value = new Set()
    selectedEdges.value = new Set()
  }

  function isSelectedNode(id: string): boolean {
    return selectedNodes.value.has(id)
  }

  function isSelectedEdge(id: string): boolean {
    return selectedEdges.value.has(id)
  }

  function selectAll(): void {
    selectedNodes.value = new Set(graph.nodes.map((n) => n.id))
  }

  function selectEdge(id: string, additive: boolean): void {
    if (additive) {
      const s = new Set(selectedEdges.value)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      selectedEdges.value = s
    } else {
      selectedEdges.value = new Set([id])
      selectedNodes.value = new Set()
    }
  }

  // ---- viewport transforms ----
  function screenToWorld(p: Point): Point {
    const vp = graph.viewport
    return { x: (p.x - vp.x) / vp.zoom, y: (p.y - vp.y) / vp.zoom }
  }

  function worldToScreen(p: Point): Point {
    const vp = graph.viewport
    return { x: p.x * vp.zoom + vp.x, y: p.y * vp.zoom + vp.y }
  }

  function zoomAt(screen: Point, factor: number): void {
    const vp = graph.viewport
    const world = screenToWorld(screen)
    const next = clamp(vp.zoom * factor, editorConfig.viewport.minZoom, editorConfig.viewport.maxZoom)
    if (next === vp.zoom) return
    vp.zoom = next
    vp.x = screen.x - world.x * next
    vp.y = screen.y - world.y * next
  }

  // ---- pan ----
  function beginPan(screen: Point): void {
    panStart.value = { screen, x: graph.viewport.x, y: graph.viewport.y }
    fsm.transition('pointerdown', 'pan')
  }

  function updatePan(screen: Point): void {
    if (!panStart.value) return
    const dx = screen.x - panStart.value.screen.x
    const dy = screen.y - panStart.value.screen.y
    graph.viewport.x = panStart.value.x + dx
    graph.viewport.y = panStart.value.y + dy
  }

  function endPan(): void {
    panStart.value = null
    fsm.transition('pointerup')
  }

  // ---- box select ----
  function beginBoxSelect(world: Point): void {
    boxStart.value = world
    boxCurrent.value = world
    fsm.transition('pointerdown', 'on-empty')
  }

  function updateBoxSelect(world: Point): void {
    boxCurrent.value = world
  }

  function endBoxSelect(additive: boolean): void {
    const start = boxStart.value
    const cur = boxCurrent.value
    boxStart.value = null
    boxCurrent.value = null
    if (start && cur) {
      const minX = Math.min(start.x, cur.x)
      const maxX = Math.max(start.x, cur.x)
      const minY = Math.min(start.y, cur.y)
      const maxY = Math.max(start.y, cur.y)
      const inside = graph.nodes.filter(
        (n) => n.x + n.width >= minX && n.x <= maxX && n.y + n.height >= minY && n.y <= maxY,
      )
      if (maxX - minX < 2 && maxY - minY < 2) {
        if (!additive) clearSelection()
      } else {
        const ids = inside.map((n) => n.id)
        if (additive) {
          selectedNodes.value = new Set([...selectedNodes.value, ...ids])
        } else {
          selectOnly(ids)
        }
      }
    }
    fsm.transition('pointerup')
  }

  // ---- node drag ----
  function handleNodeDown(id: string, world: Point, additive: boolean): void {
    if (additive) {
      const s = new Set(selectedNodes.value)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      selectedNodes.value = s
      selectedEdges.value = new Set()
      return
    }
    if (!selectedNodes.value.has(id)) selectOnly([id])
    beginNodeDrag(world)
  }

  function beginNodeDrag(world: Point): void {
    dragStartWorld.value = world
    dragStartPos.clear()
    for (const n of graph.nodes) {
      if (selectedNodes.value.has(n.id)) dragStartPos.set(n.id, { x: n.x, y: n.y })
    }
    fsm.transition('pointerdown', 'on-node')
  }

  function updateNodeDrag(world: Point): void {
    if (!dragStartWorld.value) return
    const dx = world.x - dragStartWorld.value.x
    const dy = world.y - dragStartWorld.value.y
    for (const n of graph.nodes) {
      const start = dragStartPos.get(n.id)
      if (start) {
        n.x = start.x + dx
        n.y = start.y + dy
      }
    }
  }

  function endNodeDrag(): void {
    const moves: { id: string; from: Point; to: Point }[] = []
    for (const n of graph.nodes) {
      const start = dragStartPos.get(n.id)
      if (start && (start.x !== n.x || start.y !== n.y)) {
        moves.push({ id: n.id, from: start, to: { x: n.x, y: n.y } })
      }
    }
    dragStartWorld.value = null
    dragStartPos.clear()
    if (moves.length) history.execute(new MoveNodesCommand(graph, moves))
    fsm.transition('pointerup')
  }

  // ---- connect ----
  function beginConnect(id: string, anchor: Anchor, world: Point): void {
    connectSource.value = id
    connectAnchor.value = anchor
    tempEnd.value = world
    fsm.transition('pointerdown', 'on-anchor')
  }

  function updateConnect(world: Point): void {
    tempEnd.value = world
  }

  function endConnectAt(world: Point): void {
    const srcId = connectSource.value
    connectSource.value = null
    connectAnchor.value = null
    tempEnd.value = null
    if (srcId) {
      const target = nodeAt(world)
      if (target && target.id !== srcId) {
        const edge = createEdge(srcId, target.id)
        history.execute(new AddEdgesCommand(graph, [edge]))
        selectedEdges.value = new Set([edge.id])
        selectedNodes.value = new Set()
      }
    }
    fsm.transition('pointerup')
  }

  // ---- label editing ----
  function beginEdit(id: string): void {
    const n = nodeById(id)
    if (!n) return
    editingPrev = n.label
    editingId.value = id
    fsm.transition('dblclick', 'on-node')
  }

  function commitEdit(text: string): void {
    const id = editingId.value
    editingId.value = null
    fsm.transition('blur')
    const n = id ? nodeById(id) : undefined
    if (n && text !== editingPrev) {
      history.execute(new UpdateNodeLabelCommand(n, text, editingPrev))
    }
  }

  function cancelEdit(): void {
    editingId.value = null
    fsm.transition('blur')
  }

  // ---- edit ops ----
  function addNode(shape: NodeShape, p: Point): void {
    const node = createNode(shape, p)
    history.execute(new AddNodesCommand(graph, [node]))
    selectOnly([node.id])
  }

  function deleteSelection(): void {
    const nIds = selectedNodes.value
    const eIds = selectedEdges.value
    if (nIds.size === 0 && eIds.size === 0) return
    const nodes = graph.nodes.filter((n) => nIds.has(n.id))
    const edges = graph.edges.filter((e) => eIds.has(e.id))
    const cmds: Command[] = []
    if (nodes.length) cmds.push(new RemoveNodesCommand(graph, nodes))
    if (edges.length) cmds.push(new RemoveEdgesCommand(graph, edges))
    history.execute(cmds.length === 1 ? cmds[0] : new CompositeCommand(cmds))
    clearSelection()
  }

  function undo(): void {
    history.undo()
  }

  function redo(): void {
    history.redo()
  }

  // ---- clipboard ----
  function copy(): void {
    const nodes = graph.nodes.filter((n) => selectedNodes.value.has(n.id))
    if (nodes.length === 0) return
    const ids = new Set(nodes.map((n) => n.id))
    const edges = graph.edges.filter(
      (e) => selectedEdges.value.has(e.id) || (ids.has(e.source) && ids.has(e.target)),
    )
    clipboard = {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
    }
  }

  function paste(): void {
    if (!clipboard) return
    const offset = editorConfig.pasteOffset
    const idMap = new Map<string, string>()
    const nodes = clipboard.nodes.map((n) => {
      const id = uid('n')
      idMap.set(n.id, id)
      return { ...n, id, x: n.x + offset, y: n.y + offset }
    })
    const edges = clipboard.edges
      .map((e) => {
        const s = idMap.get(e.source)
        const t = idMap.get(e.target)
        if (!s || !t) return null
        return { ...e, id: uid('e'), source: s, target: t }
      })
      .filter((e): e is GraphEdge => e !== null)
    const cmds: Command[] = [new AddNodesCommand(graph, nodes)]
    if (edges.length) cmds.push(new AddEdgesCommand(graph, edges))
    history.execute(cmds.length === 1 ? cmds[0] : new CompositeCommand(cmds))
    selectOnly(nodes.map((n) => n.id))
  }

  // ---- serialization ----
  function save(): string {
    return toJSON(graph)
  }

  function load(text: string): void {
    const g = fromJSON(text)
    graph.nodes.splice(0, graph.nodes.length, ...g.nodes)
    graph.edges.splice(0, graph.edges.length, ...g.edges)
    Object.assign(graph.viewport, g.viewport)
    history.clear()
    clearSelection()
    editingId.value = null
  }

  // ---- export ----
  function exportSVG(): void {
    const svg = buildSvgString(graph)
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'flowgraph.svg')
  }

  async function exportPNG(): Promise<void> {
    const svg = buildSvgString(graph)
    const blob = await svgToPngBlob(svg)
    downloadBlob(blob, 'flowgraph.png')
  }

  // ---- pointer orchestration ----
  function pointerDown(
    target: PointerTarget,
    world: Point,
    screen: Point,
    opts: { additive: boolean; panning: boolean },
  ): void {
    if (opts.panning) {
      beginPan(screen)
      return
    }
    switch (target.kind) {
      case 'node':
        handleNodeDown(target.id, world, opts.additive)
        break
      case 'edge':
        selectEdge(target.id, opts.additive)
        break
      case 'anchor':
        beginConnect(target.id, target.anchor, world)
        break
      case 'empty':
        beginBoxSelect(world)
        break
    }
  }

  function pointerMove(world: Point, screen: Point): void {
    switch (fsm.current) {
      case 'selecting':
        updateBoxSelect(world)
        break
      case 'moving-selection':
        updateNodeDrag(world)
        break
      case 'connecting':
        updateConnect(world)
        break
      case 'panning':
        updatePan(screen)
        break
    }
  }

  function pointerUp(world: Point, opts: { additive: boolean }): void {
    switch (fsm.current) {
      case 'selecting':
        endBoxSelect(opts.additive)
        break
      case 'moving-selection':
        endNodeDrag()
        break
      case 'connecting':
        endConnectAt(world)
        break
      case 'panning':
        endPan()
        break
    }
  }

  return {
    graph,
    mode,
    history,
    canUndo,
    canRedo,
    selectedNodes,
    selectedEdges,
    boxStart,
    boxCurrent,
    connectSource,
    connectAnchor,
    tempEnd,
    editingId,
    nodeById,
    screenToWorld,
    worldToScreen,
    zoomAt,
    isSelectedNode,
    isSelectedEdge,
    selectAll,
    clearSelection,
    addNode,
    deleteSelection,
    beginEdit,
    commitEdit,
    cancelEdit,
    undo,
    redo,
    copy,
    paste,
    save,
    load,
    exportSVG,
    exportPNG,
    pointerDown,
    pointerMove,
    pointerUp,
  }
}
