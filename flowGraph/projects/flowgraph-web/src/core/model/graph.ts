import type { Graph, GraphNode, GraphEdge, NodeShape, Point } from './types'
import { editorConfig, strings } from '../resources'

let counter = 0

export function uid(prefix: string): string {
  counter += 1
  return `${prefix}${counter.toString(36)}${Date.now().toString(36)}`
}

export function createGraph(): Graph {
  const { defaultZoom } = editorConfig.viewport
  return { version: 1, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: defaultZoom } }
}

export function createNode(shape: NodeShape, p: Point): GraphNode {
  const { width, height } = editorConfig.defaultNode
  return {
    id: uid('n'),
    type: shape,
    label: strings.node.defaultLabel,
    x: p.x - width / 2,
    y: p.y - height / 2,
    width,
    height,
  }
}

export function createEdge(source: string, target: string): GraphEdge {
  return { id: uid('e'), source, target, type: 'line' }
}
