import type { Graph, GraphNode, GraphEdge } from '../model/types'
import { editorConfig } from '../resources'

export function toJSON(graph: Graph): string {
  return JSON.stringify(
    {
      version: 1,
      nodes: graph.nodes,
      edges: graph.edges,
      viewport: graph.viewport,
    },
    null,
    2,
  )
}

export function fromJSON(text: string): Graph {
  const data = JSON.parse(text)
  return normalize(data)
}

function normalize(data: unknown): Graph {
  const d = data as Record<string, unknown>
  if (!d || d.version !== 1) {
    throw new Error('非法图数据：version 必须为 1')
  }
  if (!Array.isArray(d.nodes) || !Array.isArray(d.edges)) {
    throw new Error('非法图数据：缺少 nodes / edges')
  }

  const shapes = new Set(editorConfig.nodeShapes)

  const nodes: GraphNode[] = (d.nodes as unknown[]).map((raw) => {
    const n = raw as Record<string, unknown>
    if (typeof n.id !== 'string' || !shapes.has(n.type as string)) {
      throw new Error(`非法节点：${JSON.stringify(raw)}`)
    }
    return {
      id: n.id,
      type: n.type as GraphNode['type'],
      label: typeof n.label === 'string' ? n.label : '',
      x: n.x as number,
      y: n.y as number,
      width: n.width as number,
      height: n.height as number,
    }
  })

  const edges: GraphEdge[] = (d.edges as unknown[]).map((raw) => {
    const e = raw as Record<string, unknown>
    return {
      id: e.id as string,
      source: e.source as string,
      target: e.target as string,
      type: (e.type as GraphEdge['type']) ?? 'line',
      label: typeof e.label === 'string' ? e.label : undefined,
    }
  })

  const vp = (d.viewport as Record<string, unknown>) ?? {}
  const viewport = {
    x: (vp.x as number) ?? 0,
    y: (vp.y as number) ?? 0,
    zoom: (vp.zoom as number) ?? editorConfig.viewport.defaultZoom,
  }

  return { version: 1, nodes, edges, viewport }
}
