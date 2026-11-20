import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

// 路由表同时承担两件事：页面匹配，以及侧栏菜单的数据来源（meta）。
// 详情页不是独立菜单项，用 meta.menu 指回列表路径，保证侧栏仍然高亮。
const layoutRoute = {
  path: '/',
  component: AppLayout,
  redirect: '/home',
  children: [
    {
      path: 'home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: '学习首页', icon: 'HomeFilled' },
    },
    {
      path: 'users',
      name: 'users',
      component: () => import('../views/UserListView.vue'),
      meta: { title: '用户管理', icon: 'User' },
    },
    {
      path: 'users/:id',
      name: 'user-detail',
      component: () => import('../views/UserDetailView.vue'),
      meta: { title: '用户详情', menu: '/users', hidden: true },
    },
    {
      path: 'favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
      meta: { title: '收藏用户', icon: 'Star' },
    },
    {
      path: 'components',
      name: 'components',
      component: () => import('../views/ComponentsView.vue'),
      meta: { title: '组件示例', icon: 'Grid' },
    },
  ],
}

const routes = [
  layoutRoute,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

export const menuRoutes = layoutRoute.children.filter((route) => !route.meta?.hidden)

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 页面标题跟着路由变化，菜单与标题共用同一份 meta，避免重复维护。
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Vue 学习台` : 'Vue 学习台'
})

export default router
