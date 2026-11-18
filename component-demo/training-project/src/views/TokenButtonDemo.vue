<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '../components/AppButton/AppButton.vue'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Variant[] = ['primary', 'secondary', 'danger', 'ghost']
const sizes: Size[] = ['sm', 'md', 'lg']

const brand = ref('#2563eb')
const radius = ref(10)
const paddingX = ref(16)
const variant = ref<Variant>('primary')
const size = ref<Size>('md')
const disabled = ref(false)
const loading = ref(false)
const block = ref(false)

function hexToRgbChannels(hex: string) {
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }

  const numeric = Number.parseInt(value, 16)
  if (Number.isNaN(numeric)) {
    return '37 99 235'
  }

  return `${(numeric >> 16) & 255} ${(numeric >> 8) & 255} ${numeric & 255}`
}

const brandVars = computed<Record<string, string>>(() => ({
  '--color-brand': brand.value,
  '--color-brand-hover': `color-mix(in srgb, ${brand.value} 86%, white)`,
  '--color-brand-active': `color-mix(in srgb, ${brand.value} 86%, black)`,
  '--color-brand-soft': `color-mix(in srgb, ${brand.value} 16%, transparent)`,
  '--color-brand-rgb': hexToRgbChannels(brand.value),
}))

const buttonVars = computed<Record<string, string>>(() => ({
  '--btn-radius': `${radius.value}px`,
  '--btn-padding-x': `${paddingX.value}px`,
}))

const snippet = computed(
  () => `/* 1. 换品牌色：只改语义层 */
:root {
  --color-brand: ${brand.value};
  --color-brand-hover: color-mix(in srgb, ${brand.value} 86%, white);
  --color-brand-active: color-mix(in srgb, ${brand.value} 86%, black);
  --color-brand-rgb: ${hexToRgbChannels(brand.value)};
}

/* 2. 单颗按钮微调：覆盖组件层 */
.app-button {
  --btn-radius: ${radius.value}px;
  --btn-padding-x: ${paddingX.value}px;
}`,
)
</script>

<template>
  <section class="demo-card token-button-demo" :style="brandVars">
    <h2>练习 8：Design Token 按钮</h2>
    <p class="demo-card__hint">
      右侧改 token，左侧按钮实时响应。组件内部没有写死颜色和圆角。
    </p>

    <div class="token-button-demo__layout">
      <div class="token-button-demo__preview">
        <div class="token-button-demo__stage">
          <AppButton
            :variant="variant"
            :size="size"
            :disabled="disabled"
            :loading="loading"
            :block="block"
            :style="buttonVars"
          >
            保存更改
          </AppButton>
        </div>

        <div class="token-button-demo__group">
          <p class="token-button-demo__label">四种变体</p>
          <div class="demo-row">
            <AppButton
              v-for="item in variants"
              :key="item"
              :variant="item"
              :size="size"
            >
              {{ item }}
            </AppButton>
          </div>
        </div>

        <div class="token-button-demo__group">
          <p class="token-button-demo__label">三种尺寸</p>
          <div class="demo-row">
            <AppButton v-for="item in sizes" :key="item" :size="item">
              {{ item }}
            </AppButton>
          </div>
        </div>
      </div>

      <form class="token-button-demo__panel" @submit.prevent>
        <label class="token-field">
          <span>品牌色 --color-brand</span>
          <span class="token-field__row">
            <input v-model="brand" type="color" />
            <code>{{ brand }}</code>
          </span>
        </label>

        <label class="token-field">
          <span>圆角 --btn-radius：{{ radius }}px</span>
          <input v-model.number="radius" type="range" min="0" max="28" step="1" />
        </label>

        <label class="token-field">
          <span>内边距 --btn-padding-x：{{ paddingX }}px</span>
          <input
            v-model.number="paddingX"
            type="range"
            min="8"
            max="40"
            step="1"
          />
        </label>

        <label class="token-field">
          <span>变体 variant</span>
          <select v-model="variant">
            <option v-for="item in variants" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="token-field">
          <span>尺寸 size</span>
          <select v-model="size">
            <option v-for="item in sizes" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label class="token-field token-field--inline">
          <input v-model="disabled" type="checkbox" />
          <span>禁用状态</span>
        </label>

        <label class="token-field token-field--inline">
          <input v-model="loading" type="checkbox" />
          <span>加载中 loading</span>
        </label>

        <label class="token-field token-field--inline">
          <input v-model="block" type="checkbox" />
          <span>撑满宽度 block</span>
        </label>
      </form>
    </div>

    <pre class="token-button-demo__code">{{ snippet }}</pre>
  </section>
</template>

<style scoped>
.token-button-demo {
  grid-column: 1 / -1;
}

.token-button-demo__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(250px, 0.85fr);
  gap: var(--space-5);
  margin-top: var(--space-5);
}

.token-button-demo__preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  background:
    radial-gradient(
      circle at 18% 0%,
      rgb(var(--color-brand-rgb) / 0.14),
      transparent 55%
    ),
    var(--color-surface);
}

.token-button-demo__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 118px;
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}

.token-button-demo__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.token-button-demo__label {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.token-button-demo__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface-muted);
}

.token-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.token-field__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.token-field code {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.token-field input[type='color'] {
  width: 44px;
  height: 32px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
}

.token-field input[type='range'] {
  width: 100%;
  accent-color: var(--color-brand);
}

.token-field select {
  height: 34px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}

.token-field--inline {
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
}

.token-field--inline input {
  accent-color: var(--color-brand);
}

.token-button-demo__code {
  margin: var(--space-5) 0 0;
  padding: var(--space-4);
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-page);
  color: var(--color-text);
  font-size: var(--font-size-xs);
  line-height: 1.7;
}

@media (max-width: 760px) {
  .token-button-demo__layout {
    grid-template-columns: 1fr;
  }
}
</style>
