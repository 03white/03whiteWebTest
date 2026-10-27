<script setup lang="ts">
import { ref } from 'vue'
import { useGraphEditor } from '../core/editor'
import { editorConfig, strings } from '../core/resources'
import { downloadBlob } from '../export/export'
import type { NodeShape } from '../core/model/types'

type Editor = ReturnType<typeof useGraphEditor>

const props = defineProps<{ editor: Editor }>()
const editor = props.editor

const shapes = editorConfig.nodeShapes as NodeShape[]
const shapeLabel: Record<string, string> = {
  rect: '矩形',
  rounded: '圆角',
  diamond: '菱形',
  ellipse: '椭圆',
}

const addCount = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

function addNode(shape: NodeShape) {
  addCount.value += 1
  const offset = addCount.value * 32
  editor.addNode(shape, { x: 160 + offset, y: 160 + offset })
}

function saveJSON() {
  downloadBlob(new Blob([editor.save()], { type: 'application/json' }), 'flowgraph.json')
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  file.text().then((text) => {
    try {
      editor.load(text)
    } catch (err) {
      window.alert(`载入失败：${(err as Error).message}`)
    }
  })
  input.value = ''
}

async function exportPNG() {
  try {
    await editor.exportPNG()
  } catch (err) {
    window.alert(`导出失败：${(err as Error).message}`)
  }
}
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__group">
      <button
        v-for="s in shapes"
        :key="s"
        class="toolbar__btn"
        :title="`添加${shapeLabel[s] ?? s}节点`"
        @click="addNode(s)"
      >
        {{ shapeLabel[s] ?? s }}
      </button>
    </div>

    <div class="toolbar__group">
      <button class="toolbar__btn" :disabled="!editor.canUndo.value" @click="editor.undo()">
        {{ strings.toolbar.undo }}
      </button>
      <button class="toolbar__btn" :disabled="!editor.canRedo.value" @click="editor.redo()">
        {{ strings.toolbar.redo }}
      </button>
    </div>

    <div class="toolbar__group">
      <button class="toolbar__btn" @click="editor.copy()">{{ strings.toolbar.copy }}</button>
      <button class="toolbar__btn" @click="editor.paste()">{{ strings.toolbar.paste }}</button>
      <button class="toolbar__btn" @click="editor.deleteSelection()">{{ strings.toolbar.delete }}</button>
    </div>

    <div class="toolbar__group">
      <button class="toolbar__btn" @click="saveJSON">存 JSON</button>
      <button class="toolbar__btn" @click="fileInput?.click()">载 JSON</button>
      <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFileChange" />
    </div>

    <div class="toolbar__group">
      <button class="toolbar__btn" @click="editor.exportSVG()">{{ strings.toolbar.exportSvg }}</button>
      <button class="toolbar__btn" @click="exportPNG">{{ strings.toolbar.exportPng }}</button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}
.toolbar__group {
  display: flex;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid #e2e8f0;
}
.toolbar__group:last-child {
  border-right: none;
}
.toolbar__btn {
  padding: 4px 10px;
  font-size: 13px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
.toolbar__btn:hover:not(:disabled) {
  background: #f1f5f9;
}
.toolbar__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
