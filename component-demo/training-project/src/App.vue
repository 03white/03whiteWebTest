<script setup lang="ts">
import StatusDotDemo from './views/StatusDotDemo.vue'
import StatusTagDemo from './views/StatusTagDemo.vue'
import CountButtonDemo from './views/CountButtonDemo.vue'
import BaseCardDemo from './views/BaseCardDemo.vue'
import BaseSwitchDemo from './views/BaseSwitchDemo.vue'
import BaseInputDemo from './views/BaseInputDemo.vue'
import AppButtonDemo from './views/AppButtonDemo.vue'
</script>

<template>
  <main class="page-shell">
    <header class="page-header">
      <p class="eyebrow">component-demo / training-project</p>
      <h1>Vue 组件训练场</h1>
      <p class="intro">先看演示，再打开对应组件文件，按 docs/06-动手训练清单.md 逐个完成。</p>
    </header>

    <section class="notice">
      <strong>当前规则：</strong>
      这里的组件是练习起始模板。不要一次让 AI 生成全部答案，先完成当前练习的最小功能。
    </section>

    <div class="demo-grid">
      <StatusDotDemo />
      <StatusTagDemo />
      <CountButtonDemo />
      <BaseCardDemo />
      <BaseSwitchDemo />
      <BaseInputDemo />
      <AppButtonDemo />
    </div>
  </main>
</template>
