<script setup lang="ts">
type TagType = 'success' | 'warning' | 'error'

interface Props {
  text?: string
  type?: TagType
  plain?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  text: '',
  type: 'success',
  plain: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button
    class="status-tag"
    :class="[`status-tag--${type}`, { 'status-tag--plain': plain, 'is-disabled': disabled }]"
    :disabled="disabled"
    type="button"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<style scoped>
.status-tag {
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: #fff;
  font-size: 13px;
}

.status-tag--success {
  background: #16a34a;
}

.status-tag--warning {
  background: #d97706;
}

.status-tag--error {
  background: #dc2626;
}

.status-tag--plain {
  background: transparent;
}

.status-tag--plain.status-tag--success {
  border-color: #16a34a;
  color: #16a34a;
}

.status-tag--plain.status-tag--warning {
  border-color: #d97706;
  color: #d97706;
}

.status-tag--plain.status-tag--error {
  border-color: #dc2626;
  color: #dc2626;
}

.status-tag.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
