<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger'

interface Props {
  variant?: Variant
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
})
</script>

<template>
  <button
    class="app-button"
    :class="`app-button--${variant}`"
    :disabled="disabled"
    type="button"
  >
    <slot>按钮</slot>
  </button>
</template>

<style scoped>
.app-button {
  padding: 9px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 700;
}

.app-button--primary {
  background: #2563eb;
  color: #fff;
}

.app-button--secondary {
  border-color: #cbd5e1;
  background: #fff;
  color: #334155;
}

.app-button--danger {
  background: #dc2626;
  color: #fff;
}
</style>
