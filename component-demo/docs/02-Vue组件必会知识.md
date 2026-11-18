# 02 Vue 组件必会知识

## `.vue` 文件的三块

```vue
<script setup lang="ts">
// 数据、计算、事件和组件逻辑
</script>

<template>
  <!-- 页面结构 -->
</template>

<style scoped>
/* 当前组件样式 */
</style>
```

大白话记忆：`script` 是脑子，`template` 是骨架，`style` 是衣服。

## `ref`：会变化的数据

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function add() {
  count.value++
}
</script>

<template>
  <button @click="add">点击 {{ count }}</button>
</template>
```

- 在 `script` 中修改要写 `count.value`。
- 在 `template` 中直接写 `count`。

## `computed`：根据已有数据算出的结果

```ts
const textLength = computed(() => props.modelValue.length)
```

能根据现有数据算出来的值，优先用 `computed`，不要再建一份数据手动同步。

## `props`：父组件传数据给子组件

```vue
<script setup lang="ts">
interface Props {
  text: string
  disabled?: boolean  
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})
</script>

<template>
  <button :disabled="props.disabled">{{ props.text }}</button>
</template>
```

- `text: string`：必须传字符串。
- `disabled?: boolean`：可以不传。
- `withDefaults`：设置默认值。

重要规则：**不要直接修改 props。**

## `emit`：子组件通知父组件

```ts
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
```

使用时：`<MyButton @click="save" />`。

## `v-model`：父子共同维护一个值

父组件：`<MyInput v-model="keyword" />`。

子组件：

```ts
const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}
```

```vue
<input :value="props.modelValue" @input="onInput" />
```

记住：`v-model = modelValue + update:modelValue`。

## `slot`：给外部留座位

子组件：

```vue
<div class="card">
  <header><slot name="title" /></header>
  <main><slot /></main>
</div>
```

父组件：

```vue
<MyCard>
  <template #title>用户信息</template>
  <p>张三</p>
</MyCard>
```

## `$attrs`：把没声明的属性继续往下传

```vue
<button v-bind="$attrs">按钮</button>
```

封装第三方组件时常见：`<VanTagRaw v-bind="$attrs" />`。

意思是：“我只改一部分，其他能力尽量交给底层组件”。

## 常见模板语法

```vue
<div v-if="visible">条件成立才显示</div>
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
<button :disabled="disabled" @click="handleClick">按钮</button>
```

- `v-if`：控制是否存在。
- `v-for`：循环生成内容。
- `:属性`：绑定 JavaScript 数据。
- `@事件`：监听用户操作。

## `scoped` 和 `:deep`

`scoped` 表示样式尽量只影响当前组件。

```scss
.wrapper {
  :deep(.van-button__text) {
    display: flex;
  }
}
```

`:deep` 用来修改子组件内部样式，但不要滥用。第三方组件升级后，内部类名可能变化。

## TypeScript 先学三种写法

```ts
interface Props {
  text: string
  disabled?: boolean
}

type Status = 'success' | 'warning' | 'error'

const value = (event.target as HTMLInputElement).value
```

现阶段看懂对象类型、可选属性、联合类型和 DOM 类型转换，已经足够写简单组件。

