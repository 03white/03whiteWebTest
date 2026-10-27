<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  change: [value: number]
}>()

const count = ref(0)

function increment() {
  if (props.disabled) return

  count.value += 1
  emit('change', count.value)
}
</script>

<template>
  <button type="button" :disabled="disabled" @click="increment">
    点击次数：{{ count }}
  </button>
</template>
