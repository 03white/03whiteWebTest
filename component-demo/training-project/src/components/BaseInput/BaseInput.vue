<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  disabled: false,
})
</script>

<template>
  <input class="base-input" :value="modelValue" :placeholder="placeholder" :disabled="disabled" />
</template>

<style scoped>
.base-input {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
}

.base-input:focus {
  border-color: #2563eb;
}
</style>
