<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  disabled: false,
  clearable: true
})
const emit=defineEmits<{
  'update:modelValue': [value: string]
}>()
function handleInput(event: Event) {
  if(props.disabled) return
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input class="base-input" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="handleInput" />
  <button class="clear-button" v-if="clearable" @click="emit('update:modelValue', '')">清空</button>
</template>

<style scoped>
.base-input {
  width: 50%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
}
.base-input:focus {
  border-color: #2563eb;
}
.clear-button {
  margin-left: 8px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #f87171;
  color: white;
  cursor: pointer;
}
</style>
