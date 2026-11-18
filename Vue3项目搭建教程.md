# Vue3 + Vite 前端项目搭建完整教程

> 目标：用 Vite 搭建 Vue3 项目，集成 **Vue Router、Pinia、Axios、Element Plus**，
> 制作主页树形菜单，编写测试页面路由，并通过**全局导航守卫**实现简单的权限控制。
>
> 本文档每一步都写了「**做什么**」（命令/操作）和「**讲什么**」（录视频时可以念的解说词），
> 你可以边做边念，做成完整录屏。

---

## 0. 环境准备

**做什么**：打开终端，确认 Node 和 npm 已安装。

```bash
node -v
npm -v
```

**讲什么**：
> 「首先确认一下我们的开发环境。Node 建议使用 16 及以上版本，Vite 官方要求 18 或 20 以上。
> 我这里显示的是 Node 22，npm 9，环境没有问题。」

---

## 1. 创建 Vite 项目

**做什么**：在目标目录执行脚手架命令。

```bash
npm create vite@latest vue3-admin-demo -- --template vue
```

参数说明：
- `vue3-admin-demo`：项目名
- `--template vue`：使用 Vue 模板（避免交互式选择）

**讲什么**：
> 「Vite 是目前最快的构建工具之一。我们用它来初始化一个 Vue3 项目。
> `--template vue` 表示直接使用 Vue 模板，不用再手动选择。」

**做什么**：进入项目目录。

```bash
cd vue3-admin-demo
```

---

## 2. 安装依赖

**做什么**：先安装模板自带依赖，再安装我们要集成的库。

```bash
npm install
npm install vue-router@4 pinia axios element-plus @element-plus/icons-vue
```

各依赖作用：

| 依赖 | 作用 |
|------|------|
| `vue-router@4` | 路由管理（Vue3 用 4.x） |
| `pinia` | 状态管理（Vue3 官方推荐） |
| `axios` | HTTP 请求库 |
| `element-plus` | Vue3 的 UI 组件库 |
| `@element-plus/icons-vue` | element-plus 的图标库 |

**讲什么**：
> 「vue-router 负责页面路由，pinia 负责全局状态管理，axios 用来发请求，
> element-plus 是 Vue3 的 UI 组件库。图标库单独拆出来了，方便按需使用。」

---

## 3. 规划目录结构

**做什么**：在 `src` 下创建如下目录。

```bash
mkdir -p src/api src/store src/router src/layout src/views/system src/views/test
```

最终结构：

```
src/
├── main.js               # 入口，挂载三大件
├── App.vue               # 根组件，只有 <router-view/>
├── api/
│   ├── request.js        # axios 实例 + 拦截器
│   └── user.js           # 接口方法示例
├── store/
│   ├── index.js          # 创建 pinia 实例
│   └── user.js           # 用户仓库
├── router/
│   └── index.js          # 路由表 + 全局导航守卫
├── layout/
│   └── Layout.vue        # 主页树形菜单布局
└── views/
    ├── Login.vue         # 登录页
    ├── Home.vue          # 首页
    ├── About.vue         # 关于页
    ├── NotFound.vue      # 404 页
    ├── system/           # 系统管理（仅 admin 可见）
    │   ├── UserManage.vue
    │   └── RoleManage.vue
    └── test/             # 测试页面
        ├── Test1.vue
        └── Test2.vue
```

**讲什么**：
> 「我们把项目拆成几个模块：api 放请求封装，store 放状态，router 放路由，
> layout 放布局，views 放具体页面。这样职责清晰，便于维护。」

---

## 4. 配置入口文件 main.js

**做什么**：把 `src/main.js` 改成下面内容。

```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'

const app = createApp(App)

// 全局注册 element-plus 图标组件（菜单里用 <component :is="图标名" /> 动态渲染）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)       // 状态管理
app.use(router)      // 路由
app.use(ElementPlus) // UI 组件库
app.mount('#app')
```

**讲什么**：
> 「main.js 是整个应用的入口。这里做了三件事：
> 第一，把 element-plus 的图标全部注册成全局组件，这样菜单里可以按名字动态渲染图标；
> 第二，用 `app.use` 依次挂载 pinia、router 和 element-plus；
> 第三，挂载到 `#app` 这个根节点上。」

---

## 5. 配置根组件 App.vue

**做什么**：把 `src/App.vue` 改成只有一行。

```vue
<template>
  <router-view />
</template>
```

**讲什么**：
> 「App.vue 里只放一个 `router-view`。它是路由的出口，当前匹配到的页面组件会渲染在这里。」

---

## 6. 封装 Axios（拦截器）

**做什么**：新建 `src/api/request.js`。

```js
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 后端接口前缀（可配合 vite 代理）
  timeout: 10000,
})

// 请求拦截器：统一携带 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response.data, // 直接返回 data
  (error) => {
    // 401 说明登录失效，清 token 并跳登录页
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
```

**做什么**：新建 `src/api/user.js`（接口方法示例）。

```js
import request from './request'

// 用户相关接口（示例，配合后端使用）
export function loginApi(data) {
  return request.post('/login', data)
}

export function getUserInfoApi() {
  return request.get('/user/info')
}
```

**讲什么**：
> 「axios 我们用拦截器做统一处理。请求拦截器在每次发请求前，自动从 localStorage 取出 token，
> 放进请求头的 Authorization 里；响应拦截器在收到响应后统一处理错误，
> 如果后端返回 401，说明登录失效，就清空 token 并跳回登录页。
> 这样做的好处是，业务代码里不用每次手动加 token、手动判断错误。」

---

## 7. 编写 Pinia 用户仓库

**做什么**：新建 `src/store/index.js`。

```js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

**做什么**：新建 `src/store/user.js`。

```js
import { defineStore } from 'pinia'

// 用户仓库：保存登录态与角色，做权限判断的依据
export const useUserStore = defineStore('user', {
  state: () => ({
    // 从 localStorage 读取，实现刷新后仍保持登录
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || '',
  }),
  getters: {
    isLogin: (state) => !!state.token,
  },
  actions: {
    // 登录（这里用模拟数据；实际项目应调用 api/user.js 里的接口）
    login({ username, role }) {
      this.token = 'mock-token-' + Date.now()
      this.username = username
      this.role = role
      localStorage.setItem('token', this.token)
      localStorage.setItem('username', this.username)
      localStorage.setItem('role', this.role)
    },
    logout() {
      this.token = ''
      this.username = ''
      this.role = ''
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
    },
  },
})
```

**讲什么**：
> 「pinia 是 Vue3 官方推荐的状态管理库。我们定义了一个 user 仓库，存三样东西：token、用户名和角色。
> state 初始化时从 localStorage 读取，这样刷新页面后登录状态不会丢。
> 这里还有个 getter `isLogin`，用来判断有没有 token。
> 登录和登出两个 action 里，除了改内存状态，还同步写 localStorage，保证持久化。
> 因为本次演示没有后端，登录用的是模拟数据，实际项目里应该调用接口。」

---

## 8. 编写路由与全局导航守卫

**做什么**：新建 `src/router/index.js`。

```js
import { createRouter, createWebHistory } from 'vue-router'
import pinia from '../store'
import { useUserStore } from '../store/user'

// 路由表：meta 里放 title（页面标题）、icon（菜单图标）、roles（可访问的角色）
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled', roles: ['admin', 'user'] },
      },
      {
        path: 'system/user',
        name: 'UserManage',
        component: () => import('../views/system/UserManage.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin'] },
      },
      {
        path: 'system/role',
        name: 'RoleManage',
        component: () => import('../views/system/RoleManage.vue'),
        meta: { title: '角色管理', icon: 'UserFilled', roles: ['admin'] },
      },
      {
        path: 'test/test1',
        name: 'Test1',
        component: () => import('../views/test/Test1.vue'),
        meta: { title: '测试页1', icon: 'Document', roles: ['admin', 'user'] },
      },
      {
        path: 'test/test2',
        name: 'Test2',
        component: () => import('../views/test/Test2.vue'),
        meta: { title: '测试页2', icon: 'DocumentChecked', roles: ['admin', 'user'] },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('../views/About.vue'),
        meta: { title: '关于', icon: 'InfoFilled', roles: ['admin', 'user'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局导航守卫：做权限控制
router.beforeEach((to, from, next) => {
  // 1. 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Vue3 Demo` : 'Vue3 Demo'

  const userStore = useUserStore(pinia)

  // 2. 访问登录页：已登录则直接进首页
  if (to.path === '/login') {
    if (userStore.isLogin) return next('/home')
    return next()
  }

  // 3. 未登录访问受保护页面：跳登录页，并记住来源以便登录后回跳
  if (!userStore.isLogin) {
    return next(`/login?redirect=${to.fullPath}`)
  }

  // 4. 已登录但角色无权限：回首页
  const roles = to.meta.roles
  if (roles && !roles.includes(userStore.role)) {
    return next('/home')
  }

  next()
})

export default router
```

**讲什么**：
> 「路由表里有两个顶层结构：login 是登录页，斜杠 `/` 是主布局，里面套了很多子路由。
> 每个子路由的 meta 里写了 title、icon 和 roles。roles 就是权限控制的关键，
> 它声明了这个页面哪些角色可以访问。
>
> 重点是这个全局导航守卫 `beforeEach`，它在每次路由跳转前都会执行，做四层判断：
> 第一，设置页面标题；第二，如果访问登录页但已经登录了，直接跳到首页；
> 第三，如果没登录就想访问受保护的页面，跳到登录页，并且用 `redirect` 参数记住来源，
> 这样登录后能跳回去；第四，如果登录了但角色不在该页面的 roles 里，说明没权限，踢回首页。
> 通过这几层判断，就实现了最简单的权限控制。」

---

## 9. 编写主页树形菜单布局

**做什么**：新建 `src/layout/Layout.vue`。

```vue
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
```

**讲什么**：
> 「这个布局用 element-plus 的 container 容器实现左右结构：左边是菜单，右边是头部和内容区。
>
> 树形菜单的关键是 `el-menu` 配合 `el-sub-menu`：如果菜单项有 children，就渲染成可展开的二级子菜单；
> 没有就渲染成普通的一级菜单项。菜单数据不是写死的，而是通过一个 computed 计算属性，
> 根据当前用户的角色过滤出来。所以 admin 能看到「系统管理」，user 看不到，这就是菜单级的权限控制。
>
> 另外 `el-menu` 上加了 `router` 属性，menu-item 的 index 值就是路由路径，点击菜单就会自动跳转。
> `default-active` 绑定当前路由，实现菜单高亮和路由同步。右侧头部还放了用户名和退出登录按钮。」

---

## 10. 编写登录页

**做什么**：新建 `src/views/Login.vue`。

```vue
<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">Vue3 Admin 登录</h2>
      <el-form :model="form" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员 (admin)" value="admin" />
            <el-option label="普通用户 (user)" value="user" />
          </el-select>
        </el-form-item>
        <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
      </el-form>
      <p class="tip">演示权限：admin 能看到全部菜单；user 看不到「系统管理」</p>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = reactive({ username: '', role: '' })

const handleLogin = () => {
  if (!form.username) return ElMessage.warning('请输入用户名')
  if (!form.role) return ElMessage.warning('请选择角色')
  userStore.login({ username: form.username, role: form.role })
  ElMessage.success('登录成功')
  // 回跳到登录前想访问的页面，没有则回首页
  router.push(route.query.redirect || '/home')
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
.login-btn {
  width: 100%;
}
.tip {
  margin-top: 15px;
  font-size: 12px;
  color: #999;
}
</style>
```

**讲什么**：
> 「登录页用了 el-card 卡片、el-form 表单、el-input 输入框和 el-select 下拉框。
> 点击登录后，先做简单的非空校验，然后调用仓库里的 login 方法保存登录态，
> 最后跳转：如果路由上有 redirect 参数就跳回原页面，否则回首页。
> 用下拉框选择角色，是为了方便演示两种角色的权限差异。」

---

## 11. 编写各页面

**做什么**：新建下面这些文件（内容都很简单，重点是「路由 + 权限」的演示）。

**`src/views/Home.vue`（首页）**
```vue
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
```

**`src/views/About.vue`（关于页）**
```vue
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
```

**`src/views/system/UserManage.vue`（用户管理，仅 admin）**
```vue
<template>
  <el-card>
    <template #header>用户管理</template>
    <p>此页面仅 <b>admin</b> 角色可见（权限控制演示）。</p>
  </el-card>
</template>
```

**`src/views/system/RoleManage.vue`（角色管理，仅 admin）**
```vue
<template>
  <el-card>
    <template #header>角色管理</template>
    <p>此页面仅 <b>admin</b> 角色可见（权限控制演示）。</p>
  </el-card>
</template>
```

**`src/views/test/Test1.vue`（测试页1）**
```vue
<template>
  <el-card>
    <template #header>测试页1</template>
    <p>这是一个测试路由页面，路径为 <code>/test/test1</code>。</p>
  </el-card>
</template>
```

**`src/views/test/Test2.vue`（测试页2）**
```vue
<template>
  <el-card>
    <template #header>测试页2</template>
    <p>这是一个测试路由页面，路径为 <code>/test/test2</code>。</p>
  </el-card>
</template>
```

**`src/views/NotFound.vue`（404 页）**
```vue
<template>
  <div class="nf">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
  </div>
</template>

<style scoped>
.nf {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
```

**讲什么**：
> 「这些页面内容都比较简单，重点是它们挂载在对应的路由下面。
> 系统管理里的两个页面，meta 里的 roles 只写了 admin，所以普通用户看不到也进不去；
> 测试页1、测试页2 就是演示用的测试路由页面。404 页面通过 `:pathMatch(.*)*` 这个通配路由来匹配。」

---

## 12. 清理模板自带的无关文件

**做什么**：删除脚手架生成的示例文件（可选，保持项目干净）。

```bash
rm src/components/HelloWorld.vue src/style.css
```

> 如果删除了 `style.css`，记得确认 `main.js` 里没有 `import './style.css'`（本教程的 main.js 已经去掉了）。

---

## 13. 启动项目验证

**做什么**：启动开发服务器。

```bash
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5173/`）。

**讲什么**：
> 「执行 npm run dev 启动开发服务器，浏览器打开 localhost 的 5173 端口。
> 因为没登录，访问首页会被导航守卫重定向到登录页。这就验证了守卫的第一层逻辑。」

---

## 14. 演示权限控制（录视频的高潮部分）

按下面的顺序操作并讲解：

1. **未登录访问首页** → 被重定向到登录页
   > 「我们没登录直接访问首页，被守卫拦截，跳到了登录页。」

2. **用 admin 登录** → 左侧出现完整菜单（含「系统管理」）
   > 「现在用 admin 角色登录。可以看到菜单里有『系统管理』这一项，admin 拥有全部权限。」

3. **退出，改用 user 登录** → 左侧「系统管理」消失
   > 「退出后换成 user 角色登录，对比一下，『系统管理』不见了，这就是菜单级权限控制的效果。」

4. **手动输入 `/system/user` 尝试越权** → 被守卫踢回首页
   > 「就算 user 手动在地址栏输入 `/system/user`，也会被导航守卫判断出没有权限，踢回首页。
   > 这证明权限控制不仅隐藏了菜单，还在路由层真正拦截了越权访问。」

---

## 附：核心概念速记（方便临场讲解）

- **Vue Router**：管理页面跳转，`<router-view>` 是页面出口，`beforeEach` 是全局守卫。
- **Pinia**：`defineStore` 定义仓库，`state` 存数据、`getters` 计算属性、`actions` 改数据。
- **Axios**：`create` 建实例，`interceptors` 拦截器统一加 token、统一处理错误。
- **Element Plus**：`el-menu`/`el-sub-menu`/`el-menu-item` 做树形菜单，`router` 属性让菜单跳转路由。
- **权限控制三层**：
  1. 路由 `meta.roles` 声明可访问角色；
  2. 导航守卫 `beforeEach` 运行时拦截越权；
  3. 菜单 `computed` 按角色过滤，从界面上隐藏无权限项。
