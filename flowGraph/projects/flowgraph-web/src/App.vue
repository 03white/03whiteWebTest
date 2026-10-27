<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useGraphEditor } from './core/editor'
import Toolbar from './components/Toolbar.vue'
import EditorCanvas from './components/EditorCanvas.vue'

const editor = useGraphEditor()

function onKeydown(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
  const mod = e.ctrlKey || e.metaKey
  const key = e.key.toLowerCase()
  if (mod && key === 'z') {
    e.preventDefault()
    if (e.shiftKey) editor.redo()
    else editor.undo()
  } else if (mod && key === 'y') {
    e.preventDefault()
    editor.redo()
  } else if (mod && key === 'c') {
    e.preventDefault()
    editor.copy()
  } else if (mod && key === 'v') {
    e.preventDefault()
    editor.paste()
  } else if (mod && key === 'a') {
    e.preventDefault()
    editor.selectAll()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    editor.deleteSelection()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app">
    <Toolbar :editor="editor" />
    <EditorCanvas :editor="editor" class="app__canvas" />
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.app__canvas {
  flex: 1;
  min-height: 0;
}
</style>
