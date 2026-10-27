<script setup lang="ts">
interface Props {
  title?: string
  shadow?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  shadow: true,
})
</script>

<template>
  <article class="base-card" :class="{ 'base-card--shadow': shadow }">
    <header v-if="title || $slots.title" class="base-card__header">
      <slot name="title">{{ title }}</slot>
    </header>
    <div class="base-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<style scoped>
.base-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.base-card--shadow {
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
}

.base-card__header,
.base-card__body,
.base-card__footer {
  padding: 14px 16px;
}

.base-card__header {
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
}

.base-card__footer {
  border-top: 1px solid #e2e8f0;
}
</style>
