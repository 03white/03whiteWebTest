<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--block': block, 'app-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    type="button"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="app-button__spinner" aria-hidden="true" />
    <span class="app-button__label"><slot>按钮</slot></span>
  </button>
</template>

<style scoped>
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--btn-gap);
  min-height: var(--btn-height);
  padding: 0 var(--btn-padding-x);
  overflow: hidden;
  border: 1px solid var(--btn-border-color);
  border-radius: var(--btn-radius);
  background-color: var(--btn-bg);
  color: var(--btn-color);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  line-height: 1;
  white-space: nowrap;
  box-shadow: var(--btn-shadow);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--btn-transition-duration) var(--btn-transition-ease),
    border-color var(--btn-transition-duration) var(--btn-transition-ease),
    color var(--btn-transition-duration) var(--btn-transition-ease),
    box-shadow var(--btn-transition-duration) var(--btn-transition-ease),
    transform var(--btn-transition-duration) var(--btn-transition-ease);
}

/* 掠过式高光：只做视觉，不改变布局 */
.app-button::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 20%,
    var(--btn-sheen) 50%,
    transparent 80%
  );
  opacity: 0;
  transform: translateX(-120%);
  transition:
    opacity var(--btn-transition-duration) var(--btn-transition-ease),
    transform var(--btn-transition-duration) var(--btn-transition-ease);
  content: "";
  pointer-events: none;
}

.app-button__label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: var(--btn-gap);
}

.app-button__spinner {
  width: var(--btn-spinner-size);
  height: var(--btn-spinner-size);
  flex: none;
  border: var(--btn-spinner-border) solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: app-button-spin var(--btn-spinner-duration) linear infinite;
}

@keyframes app-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- 尺寸：只重映射组件 token ---------- */
.app-button--sm {
  --btn-height: var(--btn-height-sm);
  --btn-padding-x: var(--btn-padding-x-sm);
  --btn-font-size: var(--font-size-sm);
}

.app-button--md {
  --btn-height: var(--btn-height-md);
  --btn-padding-x: var(--btn-padding-x-md);
  --btn-font-size: var(--font-size-md);
}

.app-button--lg {
  --btn-height: var(--btn-height-lg);
  --btn-padding-x: var(--btn-padding-x-lg);
  --btn-font-size: var(--font-size-lg);
}

/* ---------- 变体：只重映射组件 token ---------- */
.app-button--primary {
  --btn-bg: var(--color-brand);
  --btn-bg-hover: var(--color-brand-hover);
  --btn-bg-active: var(--color-brand-active);
  --btn-color: var(--color-on-brand);
  --btn-border-color: transparent;
  --btn-sheen: rgb(255 255 255 / 0.35);
  --btn-shadow:
    0 1px 2px rgb(var(--shadow-color) / 0.18),
    0 4px 12px rgb(var(--color-brand-rgb) / 0.24);
  --btn-shadow-hover:
    0 2px 4px rgb(var(--shadow-color) / 0.12),
    0 10px 24px rgb(var(--color-brand-rgb) / 0.3);
  --btn-focus-ring:
    0 0 0 var(--focus-ring-width) rgb(var(--color-brand-rgb) / 0.35);
}

.app-button--secondary {
  --btn-bg: var(--color-surface);
  --btn-bg-hover: var(--color-surface-muted);
  --btn-bg-active: var(--slate-200);
  --btn-color: var(--color-text);
  --btn-border-color: var(--color-border);
  --btn-sheen: rgb(var(--slate-rgb) / 0.06);
  --btn-shadow: var(--shadow-control);
  --btn-shadow-hover: var(--shadow-control-hover);
  --btn-focus-ring:
    0 0 0 var(--focus-ring-width) rgb(var(--slate-rgb) / 0.18);
}

.app-button--danger {
  --btn-bg: var(--color-danger);
  --btn-bg-hover: var(--color-danger-hover);
  --btn-bg-active: var(--color-danger-active);
  --btn-color: var(--color-on-danger);
  --btn-border-color: transparent;
  --btn-sheen: rgb(255 255 255 / 0.3);
  --btn-shadow:
    0 1px 2px rgb(var(--shadow-color) / 0.18),
    0 4px 12px rgb(var(--red-rgb) / 0.24);
  --btn-shadow-hover:
    0 2px 4px rgb(var(--shadow-color) / 0.12),
    0 10px 24px rgb(var(--red-rgb) / 0.3);
  --btn-focus-ring:
    0 0 0 var(--focus-ring-width) rgb(var(--red-rgb) / 0.35);
}

.app-button--ghost {
  --btn-bg: transparent;
  --btn-bg-hover: var(--color-brand-soft);
  --btn-bg-active: var(--blue-100);
  --btn-color: var(--color-brand);
  --btn-border-color: transparent;
  --btn-sheen: transparent;
  --btn-shadow: none;
  --btn-shadow-hover: none;
  --btn-focus-ring:
    0 0 0 var(--focus-ring-width) rgb(var(--color-brand-rgb) / 0.25);
}

.app-button--block {
  width: 100%;
}

/* ---------- 交互状态 ---------- */
@media (hover: hover) {
  .app-button:not(:disabled):hover {
    background-color: var(--btn-bg-hover);
    box-shadow: var(--btn-shadow-hover);
    transform: translateY(-1px);
  }

  .app-button:not(:disabled):hover::after {
    opacity: 1;
    transform: translateX(120%);
  }
}

.app-button:not(:disabled):active {
  background-color: var(--btn-bg-active);
  box-shadow: var(--btn-shadow);
  transform: translateY(0) scale(0.98);
}

.app-button:focus-visible {
  outline: none;
  box-shadow: var(--btn-shadow), var(--btn-focus-ring);
}

.app-button:disabled {
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.app-button:disabled::after {
  display: none;
}

.app-button--loading:disabled {
  opacity: 0.9;
  cursor: progress;
  box-shadow: var(--btn-shadow);
}

@media (prefers-reduced-motion: reduce) {
  .app-button,
  .app-button::after {
    transition: none;
  }

  .app-button:not(:disabled):hover {
    transform: none;
  }

  .app-button:not(:disabled):active {
    transform: none;
  }

  .app-button__spinner {
    animation-duration: calc(var(--btn-spinner-duration) * 2);
  }
}
</style>
