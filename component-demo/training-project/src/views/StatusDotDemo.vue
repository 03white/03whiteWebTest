<script setup lang="ts">
import StatusDot from '../components/StatusDot/StatusDot.vue'
</script>

<template>
  <section class="demo-card">
    <h2>练习 1：StatusDot</h2>
    <p class="demo-card__hint">目标：props、联合类型、动态 class。</p>
    <div class="demo-row">
      <StatusDot status="error" />
      <StatusDot status="warning" />
      <StatusDot status="error" />
    </div>
  </section>
</template>
