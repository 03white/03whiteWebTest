<template>
  <el-container class="layout">
    <!-- 左侧：树形菜单 -->
    <el-aside width="220px">
      <div class="logo">Vue3 Admin</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <!-- 遍历过滤后的菜单，有 children 的渲染为树形二级 -->
        <template v-for="item in menuList" :key="item.path">
          <el-sub-menu v-if="item.children" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-title">{{ $route.meta.title }}</div>
        <div class="header-right">
          <span class="user-info">{{ userStore.username }}（{{ userStore.role }}）</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 完整菜单配置（roles 决定谁能看到，实现菜单级权限）
const allMenus = [
  { path: '/home', title: '首页', icon: 'HomeFilled', roles: ['admin', 'user'] },
  {
    path: '/system',
    title: '系统管理',
    icon: 'Setting',
    roles: ['admin'],
    children: [
      { path: '/system/user', title: '用户管理', icon: 'User', roles: ['admin'] },
      { path: '/system/role', title: '角色管理', icon: 'UserFilled', roles: ['admin'] },
    ],
  },
  {
    path: '/test',
    title: '测试页面',
    icon: 'Document',
    roles: ['admin', 'user'],
    children: [
      { path: '/test/test1', title: '测试页1', icon: 'Document', roles: ['admin', 'user'] },
      { path: '/test/test2', title: '测试页2', icon: 'DocumentChecked', roles: ['admin', 'user'] },
    ],
  },
  { path: '/about', title: '关于', icon: 'InfoFilled', roles: ['admin', 'user'] },
]

// 根据当前用户角色过滤出可见菜单
const menuList = computed(() => {
  const role = userStore.role
  return allMenus
    .filter((m) => m.roles.includes(role))
    .map((m) => ({
      ...m,
      children: m.children ? m.children.filter((c) => c.roles.includes(role)) : undefined,
    }))
})

// 当前路由路径，用于菜单高亮
const activeMenu = computed(() => route.path)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
.el-aside {
  background-color: #304156;
}
.el-menu {
  border-right: none;
}
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}
.header-title {
  font-size: 16px;
  font-weight: bold;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  color: #666;
}
</style>
