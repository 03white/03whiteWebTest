import type { GraphNode } from '../core/model/types'
import { designTokens } from '../core/resources'

export function nodePath(n: GraphNode): string {
  const { x, y, width: w, height: h } = n
  switch (n.type) {
    case 'rect':
      return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`
    case 'rounded': {
      const r = Math.min(designTokens.radius.rounded, w / 2, h / 2)
      return (
        `M ${x + r} ${y} H ${x + w - r}` +
        ` Q ${x + w} ${y} ${x + w} ${y + r}` +
        ` V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h}` +
        ` H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r}` +
        ` V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`
      )
    }
    case 'diamond': {
      const cx = x + w / 2
      const cy = y + h / 2
      return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`
    }
    case 'ellipse': {
      const cx = x + w / 2
      const cy = y + h / 2
      const rx = w / 2
      const ry = h / 2
      return (
        `M ${cx - rx} ${cy}` +
        ` a ${rx} ${ry} 0 1 0 ${w} 0` +
        ` a ${rx} ${ry} 0 1 0 ${-w} 0 Z`
      )
    }
  }
}

export function nodeFill(): string {
  return designTokens.color.nodeFill
}

export function nodeStroke(selected: boolean): string {
  return selected ? designTokens.color.nodeStrokeSelected : designTokens.color.nodeStroke
}

export function nodeStrokeWidth(selected: boolean): number {
  return selected ? designTokens.stroke.selected : designTokens.stroke.node
}
