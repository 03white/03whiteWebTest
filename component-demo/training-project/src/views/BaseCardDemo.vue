<script setup lang="ts">
import BaseCard from '../components/BaseCard/BaseCard.vue'
</script>

<template>
  <section class="demo-card">
    <h2>练习 4：BaseCard</h2>
    <p class="demo-card__hint">目标：默认插槽、具名插槽、prop。</p>
    <BaseCard title="用户信息">
      <p>这里是默认插槽内容。</p>
      <template #footer>
        <span>这里是 footer 插槽</span>
      </template>
    </BaseCard>
  </section>
</template>
