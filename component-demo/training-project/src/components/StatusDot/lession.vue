<script setup lang="ts">
type Status = 'success' | 'warning' | 'error'
interface Props{
    status:Status
}
defineProps<Props>()
</script>

<template>
  <span class="status-dot" :class="`status-dot--${status}`" :aria-label="status" />
</template>

<style scoped>
.status-dot{
    display:inline-block;
    width:20px;
    height:20px;
    border-radius:50%;
    background:#151313;
}
.status-dot--success{
    background:#22c55e;
}
.status-dot--warning{
    background:#f59e0b;
}
.status-dot--error{
    background:#ef4444;
}

</style>