<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
})

// 业务状态到 Element Plus 标签样式的映射只维护在这一处。
const statusMap = {
  active: { label: '启用', type: 'success' },
  inactive: { label: '停用', type: 'info' },
}

const current = computed(
  // 未知值给中性标签，不默认当成“启用”，避免误判。
  () => statusMap[props.status] || { label: '未知状态', type: 'warning' },
)
</script>

<template>
  <el-tag :type="current.type" effect="light" round>{{ current.label }}</el-tag>
</template>
