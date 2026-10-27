import type { GraphNode, Point } from '../core/model/types'

export type Anchor = 'n' | 's' | 'e' | 'w'

export function nodeCenter(n: GraphNode): Point {
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 }
}

export function anchorPoint(n: GraphNode, a: Anchor): Point {
  const c = nodeCenter(n)
  switch (a) {
    case 'n':
      return { x: c.x, y: n.y }
    case 's':
      return { x: c.x, y: n.y + n.height }
    case 'e':
      return { x: n.x + n.width, y: c.y }
    case 'w':
      return { x: n.x, y: c.y }
  }
}

export function anchorTowards(source: GraphNode, target: Point): Anchor {
  const c = nodeCenter(source)
  const dx = target.x - c.x
  const dy = target.y - c.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'e' : 'w'
  }
  return dy >= 0 ? 's' : 'n'
}

export const ALL_ANCHORS: Anchor[] = ['n', 's', 'e', 'w']
