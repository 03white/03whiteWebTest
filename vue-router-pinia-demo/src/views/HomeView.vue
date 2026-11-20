<script setup>
import { RouterLink } from 'vue-router'
import PageHeader from '../components/common/PageHeader.vue'
</script>

<template>
  <div class="page">
    <PageHeader
      title="Vue 业务组件学习台"
      description="沿着一个可操作的小业务，看懂路由匹配、状态共享和业务组件封装如何配合。"
    />

    <section class="surface">
      <h2 class="section-title">推荐阅读顺序</h2>
      <ol class="reading-list">
        <li>打开用户管理，观察点击菜单后地址栏、页面标题和内容区如何一起变化。</li>
        <li>搜索、切换分页，注意条件被同步到 URL query，刷新或前进后退仍能恢复。</li>
        <li>进入某个用户详情，对比路由参数 <code>:id</code> 与 query 的区别。</li>
        <li>收藏几个用户，再打开收藏页，理解“只存 ID、列表由数据派生”的好处。</li>
        <li>回到组件示例，单独体验四个封装组件的输入与输出。</li>
      </ol>
    </section>

    <section class="grid">
      <article class="surface">
        <h2 class="section-title">布局与路由</h2>
        <p class="muted">
          一个布局父路由承载侧栏与顶栏，业务页面作为子路由懒加载。菜单与标题都由路由
          <code>meta</code> 派生。
        </p>
      </article>
      <article class="surface">
        <h2 class="section-title">Pinia 状态</h2>
        <p class="muted">
          用户与收藏放在 users store；侧栏折叠放在 app store。收藏页不复制用户对象，而是按
          ID 从用户列表派生。
        </p>
      </article>
      <article class="surface">
        <h2 class="section-title">业务组件</h2>
        <p class="muted">
          页面负责流程、store 负责数据、组件负责输入输出。弹窗和搜索表单都不直接改数据。
        </p>
      </article>
    </section>

    <section class="surface">
      <h2 class="section-title">开始体验</h2>
      <div class="entry-links">
        <RouterLink to="/users"><el-button type="primary">用户管理</el-button></RouterLink>
        <RouterLink to="/favorites"><el-button>收藏用户</el-button></RouterLink>
        <RouterLink to="/components"><el-button>组件示例</el-button></RouterLink>
      </div>
      <p class="muted note">
        数据是本地模拟数据，只在当前运行会话中保留。刷新浏览器后会恢复初始列表，收藏也会清空。
      </p>
    </section>
  </div>
</template>

<style scoped>
.reading-list {
  margin: 0;
  padding-left: 20px;
  color: var(--text-regular);
  line-height: 2;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.note {
  margin: 16px 0 0;
  font-size: 13px;
}

code {
  padding: 1px 5px;
  background: #eef2f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
