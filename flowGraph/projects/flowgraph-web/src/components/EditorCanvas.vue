<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useGraphEditor, type PointerTarget } from '../core/editor'
import type { Point, GraphNode, GraphEdge } from '../core/model/types'
import { designTokens, editorConfig } from '../core/resources'
import { nodePath } from '../render/shapes'
import { edgePath } from '../render/edges'
import { anchorPoint, nodeCenter, ALL_ANCHORS, type Anchor } from '../render/geometry'

type Editor = ReturnType<typeof useGraphEditor>

const props = defineProps<{ editor: Editor }>()
const editor = props.editor

const graph = editor.graph
const viewport = graph.viewport

const svgRef = ref<SVGSVGElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const spaceHeld = ref(false)

const transform = computed(() => `translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`)

const anchorR = computed(() => 5 / viewport.zoom)
const edgeHitWidth = computed(() => 12 / viewport.zoom)
const gridStroke = computed(() => 1 / viewport.zoom)

const gridStep = computed(() => {
  const steps = editorConfig.grid.steps
  for (const s of steps) {
    if (s * viewport.zoom >= 24) return s
  }
  return steps[steps.length - 1]
})

// ---- rendering helpers ----
function center(n: GraphNode): Point {
  return nodeCenter(n)
}

function anchorAt(n: GraphNode, a: Anchor): Point {
  return anchorPoint(n, a)
}

function nodeStroke(n: GraphNode): string {
  return editor.isSelectedNode(n.id)
    ? designTokens.color.nodeStrokeSelected
    : designTokens.color.nodeStroke
}

function nodeStrokeWidth(n: GraphNode): number {
  return editor.isSelectedNode(n.id) ? designTokens.stroke.selected : designTokens.stroke.node
}

function edgeD(e: GraphEdge): string {
  const s = editor.nodeById(e.source)
  const t = editor.nodeById(e.target)
  return s && t ? edgePath(e, s, t) : ''
}

function edgeColor(e: GraphEdge): string {
  return editor.isSelectedEdge(e.id)
    ? designTokens.color.edgeStrokeSelected
    : designTokens.color.edgeStroke
}

// ---- overlay state ----
const boxRect = computed(() => {
  const s = editor.boxStart.value
  const c = editor.boxCurrent.value
  if (!s || !c) return null
  return {
    x: Math.min(s.x, c.x),
    y: Math.min(s.y, c.y),
    w: Math.abs(c.x - s.x),
    h: Math.abs(c.y - s.y),
  }
})

const tempEdge = computed(() => {
  const id = editor.connectSource.value
  const anchor = editor.connectAnchor.value
  const end = editor.tempEnd.value
  if (!id || !anchor || !end) return null
  const n = editor.nodeById(id)
  if (!n) return null
  const from = anchorPoint(n, anchor)
  return { x1: from.x, y1: from.y, x2: end.x, y2: end.y }
})

const editingNode = computed(() => (editor.editingId.value ? editor.nodeById(editor.editingId.value) : null))
const editCenter = computed(() => {
  const n = editingNode.value
  return n ? editor.worldToScreen(nodeCenter(n)) : null
})
const editValue = ref('')
watch(editingNode, (n) => {
  if (n) editValue.value = n.label
})
watch(editCenter, (c) => {
  if (c) nextTick(() => inputEl.value?.focus() && inputEl.value?.select())
})

// ---- pointer coords ----
function screenPoint(e: MouseEvent): Point {
  const rect = svgRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function resolveTarget(e: PointerEvent): PointerTarget {
  const el = e.target as Element
  const anchorEl = el.closest('[data-anchor]')
  if (anchorEl) {
    return {
      kind: 'anchor',
      id: anchorEl.getAttribute('data-node-id') as string,
      anchor: anchorEl.getAttribute('data-anchor') as Anchor,
    }
  }
  const nodeEl = el.closest('[data-node-id]')
  if (nodeEl) return { kind: 'node', id: nodeEl.getAttribute('data-node-id') as string }
  const edgeEl = el.closest('[data-edge-id]')
  if (edgeEl) return { kind: 'edge', id: edgeEl.getAttribute('data-edge-id') as string }
  return { kind: 'empty' }
}

// ---- pointer handlers ----
function onPointerDown(e: PointerEvent) {
  e.preventDefault()
  const screen = screenPoint(e)
  const world = editor.screenToWorld(screen)
  const target = resolveTarget(e)
  const panning = spaceHeld.value || e.button === 1
  const additive = e.shiftKey
  editor.pointerDown(target, world, screen, { additive, panning })
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  const screen = screenPoint(e)
  const world = editor.screenToWorld(screen)
  editor.pointerMove(world, screen)
}

function onPointerUp(e: PointerEvent) {
  const screen = screenPoint(e)
  const world = editor.screenToWorld(screen)
  editor.pointerUp(world, { additive: e.shiftKey })
}

function onDblClick(e: MouseEvent) {
  const el = e.target as Element
  if (el.closest('[data-anchor]')) return
  const nodeEl = el.closest('[data-node-id]')
  if (nodeEl) editor.beginEdit(nodeEl.getAttribute('data-node-id') as string)
}

function onWheel(e: WheelEvent) {
  const screen = screenPoint(e)
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
  editor.zoomAt(screen, factor)
}

// ---- label input ----
function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    inputEl.value?.blur()
  } else if (e.key === 'Escape') {
    editor.cancelEdit()
  }
}

function onInputBlur() {
  editor.commitEdit(editValue.value)
}

// ---- space key ----
function onKeydown(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
  if (e.code === 'Space') {
    spaceHeld.value = true
    e.preventDefault()
  }
}

function onKeyup(e: KeyboardEvent) {
  if (e.code === 'Space') spaceHeld.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('keyup', onKeyup)
})
</script>

<template>
  <div class="canvas">
    <svg
      ref="svgRef"
      class="canvas__svg"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @dblclick="onDblClick"
      @wheel.prevent="onWheel"
    >
      <defs>
        <pattern
          id="fg-grid"
          :width="gridStep"
          :height="gridStep"
          patternUnits="userSpaceOnUse"
        >
          <path
            :d="`M ${gridStep} 0 L 0 0 0 ${gridStep}`"
            fill="none"
            :stroke="designTokens.color.grid"
            :stroke-width="gridStroke"
          />
        </pattern>
      </defs>

      <g :transform="transform">
        <rect class="canvas__grid" x="-100000" y="-100000" width="200000" height="200000" fill="url(#fg-grid)" />

        <g class="canvas__edges">
          <g v-for="e in graph.edges" :key="e.id">
            <path
              :d="edgeD(e)"
              fill="none"
              stroke="transparent"
              :stroke-width="edgeHitWidth"
              :data-edge-id="e.id"
              pointer-events="stroke"
            />
            <path
              :d="edgeD(e)"
              fill="none"
              :stroke="edgeColor(e)"
              :stroke-width="designTokens.stroke.edge"
              pointer-events="none"
            />
          </g>
        </g>

        <g class="canvas__nodes">
          <g v-for="n in graph.nodes" :key="n.id" :data-node-id="n.id">
            <path
              :d="nodePath(n)"
              :fill="designTokens.color.nodeFill"
              :stroke="nodeStroke(n)"
              :stroke-width="nodeStrokeWidth(n)"
            />
            <text
              :x="center(n).x"
              :y="center(n).y"
              text-anchor="middle"
              dominant-baseline="middle"
              :font-size="designTokens.typography.nodeLabelSize"
              :fill="designTokens.color.nodeText"
              pointer-events="none"
            >{{ n.label }}</text>
            <g v-if="editor.isSelectedNode(n.id)" class="canvas__anchors">
              <circle
                v-for="a in ALL_ANCHORS"
                :key="a"
                :cx="anchorAt(n, a).x"
                :cy="anchorAt(n, a).y"
                :r="anchorR"
                fill="#ffffff"
                :stroke="designTokens.color.anchorStroke"
                stroke-width="1.5"
                :data-node-id="n.id"
                :data-anchor="a"
              />
            </g>
          </g>
        </g>

        <line
          v-if="tempEdge"
          :x1="tempEdge.x1"
          :y1="tempEdge.y1"
          :x2="tempEdge.x2"
          :y2="tempEdge.y2"
          stroke="#94a3b8"
          stroke-width="1.5"
          stroke-dasharray="4"
          pointer-events="none"
        />

        <rect
          v-if="boxRect"
          :x="boxRect.x"
          :y="boxRect.y"
          :width="boxRect.w"
          :height="boxRect.h"
          fill="rgba(37, 99, 235, 0.08)"
          stroke="#2563eb"
          stroke-width="1"
          stroke-dasharray="4"
          pointer-events="none"
        />
      </g>
    </svg>

    <input
      v-if="editCenter"
      ref="inputEl"
      v-model="editValue"
      class="canvas__input"
      :style="{ left: editCenter.x + 'px', top: editCenter.y + 'px' }"
      @keydown="onInputKeydown"
      @blur="onInputBlur"
    />
  </div>
</template>

<style scoped>
.canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f7f8fa;
  user-select: none;
}
.canvas__svg {
  display: block;
  width: 100%;
  height: 100%;
  cursor: default;
  touch-action: none;
}
.canvas__input {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 60px;
  padding: 2px 4px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #2563eb;
  border-radius: 2px;
  outline: none;
}
</style>
