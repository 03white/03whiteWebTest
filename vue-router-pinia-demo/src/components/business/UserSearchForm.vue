<script setup>
import { reactive, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { userStatuses } from '../../data/users'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ keyword: '', status: '' }),
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

// 组件内部维护草稿，避免用户每敲一个字就往路由里写一次 query。
const draft = reactive({
  keyword: props.modelValue.keyword || '',
  status: props.modelValue.status || '',
})

// 外部条件变化（浏览器前进后退、重置）时同步回草稿。
watch(
  () => props.modelValue,
  (value) => {
    draft.keyword = value.keyword || ''
    draft.status = value.status || ''
  },
  { deep: true },
)

// v-model 的约定：不直接改 props，而是把新条件通过 update:modelValue 交给父组件。
function commit() {
  emit('update:modelValue', { keyword: draft.keyword, status: draft.status })
}

function handleSearch() {
  const value = { keyword: draft.keyword.trim(), status: draft.status }
  draft.keyword = value.keyword
  emit('update:modelValue', { ...value })
  emit('search', { ...value })
}

function handleReset() {
  draft.keyword = ''
  draft.status = ''
  emit('update:modelValue', { keyword: '', status: '' })
  emit('reset')
}
</script>

<template>
  <el-form class="search-form" inline @submit.prevent="handleSearch">
    <el-form-item label="关键词">
      <el-input
        v-model="draft.keyword"
        clearable
        placeholder="姓名或邮箱"
        :prefix-icon="Search"
        @input="commit"
        @keyup.enter="handleSearch"
      />
    </el-form-item>

    <el-form-item label="状态">
      <el-select v-model="draft.status" placeholder="全部状态" clearable @change="commit">
        <el-option
          v-for="item in userStatuses"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
