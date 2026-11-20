<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Expand, Fold, Grid, HomeFilled, Star, User } from '@element-plus/icons-vue'
import { menuRoutes } from '../router'
import { useAppStore } from '../stores/app'

const iconMap = { HomeFilled, User, Star, Grid }

const route = useRoute()
const appStore = useAppStore()
const { collapsed } = storeToRefs(appStore)

// 菜单直接由路由表派生，新增页面只需要在路由里写一次标题和图标。
const menuItems = menuRoutes.map((item) => ({
  path: '/' + item.path,
  title: item.meta.title,
  icon: iconMap[item.meta.icon],
}))

// 详情页通过 meta.menu 指向列表路径，因此侧栏仍高亮“用户管理”。
const activeMenu = computed(() => route.meta.menu || route.path)
const pageTitle = computed(() => route.meta.title || 'Vue 学习台')

const isNarrow = ref(false)
let mediaQuery = null

function syncNarrow(event) {
  isNarrow.value = event.matches
  // 窄屏默认收起侧栏，把宽度留给内容区。
  if (event.matches) appStore.setSidebarCollapsed(true)
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 768px)')
  syncNarrow(mediaQuery)
  mediaQuery.addEventListener('change', syncNarrow)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', syncNarrow)
})
</script>

<template>
  <el-container class="app-shell">
    <el-aside :width="collapsed ? '64px' : '220px'" class="app-aside">
      <div class="brand">
        <span class="brand-mark">V</span>
        <span v-show="!collapsed" class="brand-text">Vue 学习台</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        class="app-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="app-body">
      <el-header class="app-header">
        <el-button text class="collapse-button" @click="appStore.toggleSidebar()">
          <el-icon :size="18">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
        </el-button>
        <span class="app-title">{{ pageTitle }}</span>
        <span v-if="!isNarrow" class="app-subtitle">Vue Router · Pinia · Element Plus</span>
      </el-header>

      <el-main class="app-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-aside {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 0.2s ease;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 18px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  color: #fff;
  font-weight: 700;
  background: var(--brand);
  border-radius: 8px;
}

.brand-text {
  font-size: 15px;
  font-weight: 600;
}

.app-menu {
  flex: 1;
  border-right: none;
}

.app-body {
  min-width: 0;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 60px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.collapse-button {
  padding: 6px;
  color: var(--text-regular);
}

.app-title {
  font-size: 16px;
  font-weight: 600;
}

.app-subtitle {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 13px;
}

.app-main {
  padding: 24px;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .app-main {
    padding: 16px;
  }

  .app-subtitle {
    display: none;
  }
}
</style>
