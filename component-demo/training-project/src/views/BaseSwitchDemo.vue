<script setup lang="ts">
import { ref } from 'vue'
import BaseSwitch from '../components/BaseSwitch/BaseSwitch.vue'

const enabled = ref(false)
</script>

<template>
  <section class="demo-card">
    <h2>练习 5：BaseSwitch</h2>
    <p class="demo-card__hint">目标：先理解事件，再理解 v-model。</p>
    <div class="demo-row">
      <BaseSwitch v-model="enabled" />
      <span>当前状态：{{ enabled ? '开启' : '关闭' }}</span>
    </div>
  </section>
</template>
