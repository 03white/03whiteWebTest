<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '../components/BaseInput/BaseInput.vue'

const value = ref('')
</script>

<template>
  <section class="demo-card">
    <h2>练习 6：BaseInput</h2>
    <p class="demo-card__hint">起始模板只绑定显示值，你需要补全 v-model 和后续功能。</p>
    <BaseInput :model-value="value" @update:model-value="value = $event" />
    <p>父组件的值：{{ value }}</p>
  </section>
</template>
