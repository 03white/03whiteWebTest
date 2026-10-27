import designTokensRaw from '../assets/design-tokens.json'
import statemachineRaw from '../assets/statemachine.json'
import stringsRaw from '../assets/strings.zh_CN.json'
import editorConfigRaw from '../assets/configs/editor.json'

export interface EditorConfig {
  nodeShapes: string[]
  defaultNode: { type: string; width: number; height: number }
  edgeTypes: string[]
  viewport: { minZoom: number; maxZoom: number; defaultZoom: number }
  grid: { steps: number[] }
  snap: { enabled: boolean; grid: number }
  pasteOffset: number
}

export interface DesignTokens {
  color: Record<string, string>
  stroke: Record<string, number>
  radius: Record<string, number>
  spacing: Record<string, number>
  typography: Record<string, string | number>
}

export interface Strings {
  toolbar: Record<string, string>
  node: Record<string, string>
  empty: Record<string, string>
}

export const editorConfig = editorConfigRaw as unknown as EditorConfig
export const designTokens = designTokensRaw as unknown as DesignTokens
export const strings = stringsRaw as unknown as Strings
export const statemachine = statemachineRaw
