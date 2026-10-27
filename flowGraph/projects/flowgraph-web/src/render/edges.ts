import type { GraphEdge, GraphNode, Point } from '../core/model/types'
import { anchorPoint, anchorTowards, nodeCenter } from './geometry'

export function edgeEndpoints(edge: GraphEdge, source: GraphNode, target: GraphNode): { from: Point; to: Point } {
  const from = anchorPoint(source, anchorTowards(source, nodeCenter(target)))
  const to = anchorPoint(target, anchorTowards(target, nodeCenter(source)))
  return { from, to }
}

export function edgePath(edge: GraphEdge, source: GraphNode, target: GraphNode): string {
  const { from, to } = edgeEndpoints(edge, source, target)
  switch (edge.type) {
    case 'line':
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    case 'curve': {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const cx = (from.x + to.x) / 2 - dy * 0.25
      const cy = (from.y + to.y) / 2 + dx * 0.25
      return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
    }
    case 'orthogonal': {
      const mx = (from.x + to.x) / 2
      return `M ${from.x} ${from.y} L ${mx} ${from.y} L ${mx} ${to.y} L ${to.x} ${to.y}`
    }
  }
}
