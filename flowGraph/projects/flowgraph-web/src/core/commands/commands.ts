import type { Graph, GraphNode, GraphEdge, Point } from '../model/types'

export interface Command {
  label: string
  do(): void
  undo(): void
}

export class AddNodesCommand implements Command {
  label = 'add-nodes'

  constructor(private graph: Graph, private nodes: GraphNode[]) {}

  do(): void {
    this.graph.nodes.push(...this.nodes)
  }

  undo(): void {
    const ids = new Set(this.nodes.map((n) => n.id))
    this.graph.nodes = this.graph.nodes.filter((n) => !ids.has(n.id))
  }
}

export class RemoveNodesCommand implements Command {
  label = 'remove-nodes'
  private removedEdges: GraphEdge[] = []

  constructor(private graph: Graph, private nodes: GraphNode[]) {}

  do(): void {
    const ids = new Set(this.nodes.map((n) => n.id))
    this.removedEdges = this.graph.edges.filter(
      (e) => ids.has(e.source) || ids.has(e.target),
    )
    this.graph.nodes = this.graph.nodes.filter((n) => !ids.has(n.id))
    this.graph.edges = this.graph.edges.filter(
      (e) => !ids.has(e.source) && !ids.has(e.target),
    )
  }

  undo(): void {
    this.graph.nodes.push(...this.nodes)
    this.graph.edges.push(...this.removedEdges)
  }
}

export class MoveNodesCommand implements Command {
  label = 'move-nodes'

  constructor(
    private graph: Graph,
    private moves: { id: string; from: Point; to: Point }[],
  ) {}

  do(): void {
    this.apply(true)
  }

  undo(): void {
    this.apply(false)
  }

  private apply(to: boolean): void {
    const map = new Map(this.moves.map((m) => [m.id, m]))
    for (const n of this.graph.nodes) {
      const m = map.get(n.id)
      if (m) {
        n.x = to ? m.to.x : m.from.x
        n.y = to ? m.to.y : m.from.y
      }
    }
  }
}

export class UpdateNodeLabelCommand implements Command {
  label = 'update-node-label'

  constructor(
    private node: GraphNode,
    private next: string,
    private prev: string,
  ) {}

  do(): void {
    this.node.label = this.next
  }

  undo(): void {
    this.node.label = this.prev
  }
}

export class AddEdgesCommand implements Command {
  label = 'add-edges'

  constructor(private graph: Graph, private edges: GraphEdge[]) {}

  do(): void {
    this.graph.edges.push(...this.edges)
  }

  undo(): void {
    const ids = new Set(this.edges.map((e) => e.id))
    this.graph.edges = this.graph.edges.filter((e) => !ids.has(e.id))
  }
}

export class RemoveEdgesCommand implements Command {
  label = 'remove-edges'

  constructor(private graph: Graph, private edges: GraphEdge[]) {}

  do(): void {
    const ids = new Set(this.edges.map((e) => e.id))
    this.graph.edges = this.graph.edges.filter((e) => !ids.has(e.id))
  }

  undo(): void {
    this.graph.edges.push(...this.edges)
  }
}

export class CompositeCommand implements Command {
  label = 'composite'

  constructor(private commands: Command[]) {}

  do(): void {
    this.commands.forEach((c) => c.do())
  }

  undo(): void {
    ;[...this.commands].reverse().forEach((c) => c.undo())
  }
}
