export type NodeShape = 'rect' | 'rounded' | 'diamond' | 'ellipse'
export type EdgeType = 'line' | 'curve' | 'orthogonal'

export interface Point {
  x: number
  y: number
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface GraphNode {
  id: string
  type: NodeShape
  label: string
  x: number
  y: number
  width: number
  height: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  label?: string
}

export interface Graph {
  version: 1
  nodes: GraphNode[]
  edges: GraphEdge[]
  viewport: Viewport
}
