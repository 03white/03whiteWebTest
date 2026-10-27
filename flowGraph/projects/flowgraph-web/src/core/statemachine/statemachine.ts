export interface SMState {
  id: string
  description?: string
}

export interface SMTransition {
  from: string
  event: string
  guard?: string
  to: string
}

export interface SMDefinition {
  initial: string
  events: string[]
  states: SMState[]
  transitions: SMTransition[]
}

export class StateMachine {
  current: string

  constructor(private def: SMDefinition) {
    this.current = def.initial
  }

  get states(): string[] {
    return this.def.states.map((s) => s.id)
  }

  can(event: string, guard?: string): boolean {
    return this.def.transitions.some(
      (t) =>
        t.from === this.current &&
        t.event === event &&
        (guard ? t.guard === guard : !t.guard),
    )
  }

  transition(event: string, guard?: string): boolean {
    const t = this.def.transitions.find(
      (t) =>
        t.from === this.current &&
        t.event === event &&
        (guard ? t.guard === guard : !t.guard),
    )
    if (!t) return false
    this.current = t.to
    return true
  }

  reset(): void {
    this.current = this.def.initial
  }
}
