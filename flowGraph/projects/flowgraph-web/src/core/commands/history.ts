import type { Command } from './commands'

export class History {
  private undoStack: Command[] = []
  private redoStack: Command[] = []

  execute(cmd: Command): void {
    cmd.do()
    this.undoStack.push(cmd)
    this.redoStack = []
  }

  undo(): boolean {
    const cmd = this.undoStack.pop()
    if (!cmd) return false
    cmd.undo()
    this.redoStack.push(cmd)
    return true
  }

  redo(): boolean {
    const cmd = this.redoStack.pop()
    if (!cmd) return false
    cmd.do()
    this.undoStack.push(cmd)
    return true
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }
}
