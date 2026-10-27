<script setup lang="ts">
import StatusTag from '../components/StatusTag/StatusTag.vue'

function handleClick() {
  window.alert('StatusTag 被点击了')
}
</script>

<template>
  <section class="demo-card">
    <h2>练习 2：StatusTag</h2>
    <p class="demo-card__hint">目标：默认值、slot、emit、disabled。</p>
    <div class="demo-row">
      <StatusTag text="已完成" type="success" @click="handleClick" />
      <StatusTag text="处理中" type="warning" plain />
      <StatusTag type="error" disabled>已禁用</StatusTag>
    </div>
  </section>
</template>
