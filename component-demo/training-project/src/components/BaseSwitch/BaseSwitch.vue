<script setup lang="ts">
interface Props {
  modelValue: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

function toggle() {
  if (props.disabled) return

  const value = !props.modelValue
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <button
    class="base-switch"
    :class="{ 'base-switch--on': modelValue, 'is-disabled': disabled }"
    type="button"
    :disabled="disabled"
    :aria-checked="modelValue"
    role="switch"
    @click="toggle"
  >
  <span class="base-switch__thumb" />
  </button>
</template>

<style scoped>
.base-switch {
  width: 48px;
  height: 28px;
  padding: 3px;
  border: 0;
  border-radius: 999px;
  background: #cbd5e1;
  text-align: left;
  transition: background 0.2s ease;
}

.base-switch--on {
  background: #2563eb;
  text-align: right;
}

.base-switch__thumb {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  vertical-align: top;
}

.base-switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
