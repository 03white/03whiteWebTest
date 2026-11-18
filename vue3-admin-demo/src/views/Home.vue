<template>
  <el-card>
    <template #header>首页</template>
    <p>欢迎 <b>{{ userStore.username }}</b>，当前角色：<b>{{ userStore.role }}</b></p>
    <p>这是一个 Vue3 + Vite + Vue Router + Pinia + Axios + Element Plus 的演示项目。</p>
  </el-card>
</template>

<script setup>
import { useUserStore } from '../store/user'

const userStore = useUserStore()
</script>
