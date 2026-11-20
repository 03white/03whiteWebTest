<script setup lang="ts">
import { ref } from 'vue'
import CountButton from '../components/CountButton/CountButton.vue'

const latestValue = ref(0)
</script>

<template>
  <section class="demo-card">
    <h2>练习 3：CountButton</h2>
    <p class="demo-card__hint">目标：ref、点击函数、emit 参数。</p>
    <div class="demo-row">
      <CountButton @changes="latestValue = $event" />
      <span>父组件收到：{{ latestValue }}</span>
    </div>
  </section>
</template>
