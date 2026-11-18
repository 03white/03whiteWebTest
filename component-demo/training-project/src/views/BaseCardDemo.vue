<script setup lang="ts">
import BaseCard from '../components/BaseCard/BaseCard.vue'
</script>

<template>
  <section class="demo-card">
    <h2>练习 4：BaseCard</h2>
    <p class="demo-card__hint">目标：默认插槽、具名插槽、prop。</p>
    <BaseCard title="用户信息">
      <img src="..\assert\Snipaste_2026-11-18_10-38-04.png" alt="用户头像" />
      <template #footer>
        <span>无中生有</span>
      </template>
    </BaseCard>
  </section>
</template>
