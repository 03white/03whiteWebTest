import type { Graph } from '../core/model/types'
import { designTokens } from '../core/resources'
import { nodePath } from '../render/shapes'
import { edgePath } from '../render/edges'

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      default:
        return '&quot;'
    }
  })
}

function contentBounds(graph: Graph): { x: number; y: number; w: number; h: number } {
  if (graph.nodes.length === 0) {
    return { x: 0, y: 0, w: 100, h: 100 }
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of graph.nodes) {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.width)
    maxY = Math.max(maxY, n.y + n.height)
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

export function buildSvgString(graph: Graph): string {
  const b = contentBounds(graph)
  const pad = 24
  const x = b.x - pad
  const y = b.y - pad
  const w = b.w + pad * 2
  const h = b.h + pad * 2

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))

  const edgesSvg = graph.edges
    .map((e) => {
      const s = nodeMap.get(e.source)
      const t = nodeMap.get(e.target)
      if (!s || !t) return ''
      return (
        `<path d="${edgePath(e, s, t)}" fill="none"` +
        ` stroke="${designTokens.color.edgeStroke}"` +
        ` stroke-width="${designTokens.stroke.edge}"/>`
      )
    })
    .join('')

  const nodesSvg = graph.nodes
    .map((n) => {
      const cx = n.x + n.width / 2
      const cy = n.y + n.height / 2
      return (
        `<g>` +
        `<path d="${nodePath(n)}" fill="${designTokens.color.nodeFill}"` +
        ` stroke="${designTokens.color.nodeStroke}"` +
        ` stroke-width="${designTokens.stroke.node}"/>` +
        `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"` +
        ` font-size="${designTokens.typography.nodeLabelSize}"` +
        ` fill="${designTokens.color.nodeText}">${escapeXml(n.label)}</text>` +
        `</g>`
      )
    })
    .join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"` +
    ` viewBox="${x} ${y} ${w} ${h}">${edgesSvg}${nodesSvg}</svg>`
  )
}

export async function svgToPngBlob(svg: string): Promise<Blob> {
  const img = new Image()
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('SVG 加载失败'))
    img.src = url
  })
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = (img.naturalWidth || img.width || 100) * scale
  canvas.height = (img.naturalHeight || img.height || 100) * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 不可用')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出失败'))), 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
