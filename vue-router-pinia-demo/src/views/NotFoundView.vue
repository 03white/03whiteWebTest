<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Back, HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

function goBack() {
  // 有历史记录就回退，直接访问未知地址时回首页。
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="not-found">
    <el-result icon="warning" title="页面不存在" :sub-title="`没有找到 ${route.fullPath}`">
      <template #extra>
        <el-button :icon="Back" @click="goBack">返回上一页</el-button>
        <el-button type="primary" :icon="HomeFilled" @click="router.push({ name: 'home' })">
          回到学习首页
        </el-button>
      </template>
    </el-result>
  </main>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}
</style>
