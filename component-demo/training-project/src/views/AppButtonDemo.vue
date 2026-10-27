<script setup lang="ts">
import AppButton from '../components/AppButton/AppButton.vue'
</script>

<template>
  <section class="demo-card">
    <h2>练习 7：AppButton</h2>
    <p class="demo-card__hint">先完成原生 button 封装，再对照公司的 VanButton。</p>
    <div class="demo-row">
      <AppButton variant="primary">主要按钮</AppButton>
      <AppButton variant="secondary">次要按钮</AppButton>
      <AppButton variant="danger">危险按钮</AppButton>
    </div>
  </section>
</template>
