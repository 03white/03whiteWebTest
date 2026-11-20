# Vue 业务组件学习台

用一个“用户管理”小业务，串起 Vue Router、Pinia 和 Element Plus 业务组件封装。页面可以直接操作，源码按职责拆分，适合边点边读。

## 技术栈

- Vue 3 + Vite
- Vue Router（动态路由、query 同步、懒加载、404）
- Pinia（Setup Store、getter 派生、action）
- Element Plus + 官方图标
- JavaScript、Composition API、`<script setup>`
- Vitest（store 与纯逻辑单测）

## 启动

```bash
pnpm install
pnpm dev          # 本地开发
pnpm build        # 生产构建
pnpm test         # 单元测试
pnpm preview      # 预览构建产物
```

需要 Node.js 20+。使用 npm / yarn 也可以，命令换成对应写法即可。

## 目录

```text
vue-router-pinia-demo/
  src/
    main.js                 创建应用，安装 Pinia、Router、Element Plus
    App.vue                 顶层 RouterView
    styles/main.css         全局变量与通用布局类
    router/index.js         路由表 + 菜单 meta + 页面标题
    layouts/AppLayout.vue   应用壳：侧栏、顶栏、内容区
    stores/
      users.js              用户列表、收藏 ID、派生收藏用户、增改与收藏 action
      app.js                侧栏折叠状态
    data/users.js           初始模拟数据、部门与状态选项
    utils/userQuery.js      筛选、分页、ID 生成等纯函数（可单测）
    components/
      common/PageHeader.vue
      business/UserStatusTag.vue
      business/UserSearchForm.vue
      business/UserFormDialog.vue
    views/                  首页、用户列表、详情、收藏、组件示例、404
```

## 页面与知识点对照

| 页面 | 路径 | 主要知识点 |
| --- | --- | --- |
| 学习首页 | `/home` | 布局结构、阅读顺序、RouterLink 跳转 |
| 用户管理 | `/users` | query 同步、筛选与分页、动态路由入口、store action |
| 用户详情 | `/users/:id` | `useRoute` 读参数、命名路由、来源 query、派生状态 |
| 收藏用户 | `/favorites` | getter 派生数据、跨页面同步、空状态 |
| 组件示例 | `/components` | props / emit / v-model / 插槽、组件与 store 的边界 |
| 未匹配路径 | `/*` | 404 兜底与可恢复导航 |

## 推荐阅读顺序

1. `src/router/index.js`：看布局父路由、子路由、懒加载和 `meta` 如何同时驱动菜单与标题。
2. `src/layouts/AppLayout.vue`：看侧栏高亮如何跟随详情页，以及折叠状态放在 app store 的原因。
3. `src/stores/users.js`：看 state、getter、action 的分工；收藏只存 ID。
4. `src/views/UserListView.vue`：看筛选条件如何与 URL query 双向配合，以及为什么搜索时要重置页码。
5. `src/views/UserDetailView.vue`：看 `params` 与 `query` 的区别，以及返回列表时如何恢复来源条件。
6. `src/views/FavoritesView.vue`：看收藏页为什么不复制用户对象。
7. `src/components/business/`：看四个组件的输入输出，以及它们为什么不导入 store。

## 职责边界

- **基础控件 / Element Plus**：只提供通用交互与样式。
- **业务组件**：把一类业务字段和交互封装起来，例如状态标签、搜索表单、编辑弹窗；只处理输入输出。
- **页面**：组织流程，读路由、调用 store action、给出反馈。
- **store**：保存跨页面共享的业务数据，并提供修改数据的唯一入口。
- **utils**：放置与框架无关的纯计算，方便测试和复用。

## 数据说明

所有数据都是本地模拟数据，不发起网络请求，也没有登录与权限。

- 页面切换期间状态会保留（Pinia 在内存中）。
- 刷新浏览器后用户列表恢复初始值，收藏也会清空。
- 项目没有使用 localStorage 或持久化插件，后续可以在此基础上单独练习持久化。

## 验证范围

单测覆盖筛选、页码收敛、分页、ID 生成，以及 store 的新增、编辑、收藏与派生行为。生产构建用于确认模板与依赖引用无误；页面交互按设计稿的验收项手工核对。
