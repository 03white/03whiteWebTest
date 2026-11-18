<template>
  <el-card>
    <template #header>关于</template>
    <p>技术栈：</p>
    <el-tag v-for="t in stack" :key="t" class="tag">{{ t }}</el-tag>
  </el-card>
</template>

<script setup>
const stack = ['Vite', 'Vue3', 'Vue Router', 'Pinia', 'Axios', 'Element Plus']
</script>

<style scoped>
.tag {
  margin: 4px;
}
</style>
