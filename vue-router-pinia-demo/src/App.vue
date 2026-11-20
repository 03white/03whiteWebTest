<script setup>
// 顶层只负责渲染路由出口：布局页与 404 页都由路由决定。
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
