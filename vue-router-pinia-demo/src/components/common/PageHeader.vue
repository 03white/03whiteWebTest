<script setup>
// 纯展示组件：不读路由、不访问 store，因此任何页面都能复用。
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <header class="page-header">
    <div class="page-header-text">
      <h1 class="page-header-title">{{ title }}</h1>
      <p v-if="description" class="page-header-description">{{ description }}</p>
    </div>
    <div class="page-header-actions">
      <!-- actions 插槽让页面注入按钮，组件本身不关心按钮做什么。 -->
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.page-header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.page-header-description {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
