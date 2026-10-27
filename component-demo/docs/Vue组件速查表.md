# Vue 组件速查表

## 定义 props

```ts
interface Props {
  text: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
})
```

## 定义事件

```ts
const emit = defineEmits<{
  click: [event: MouseEvent]
  change: [value: string]
}>()

emit('change', 'new value')
```

## 会变化的数据

```ts
const visible = ref(false)
visible.value = true
```

## 计算结果

```ts
const textLength = computed(() => props.text.length)
```

## v-model

```ts
const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
```

```vue
<input
  :value="props.modelValue"
  @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
/>
```

## 插槽

```vue
<slot>没有传内容时显示这里</slot>
<slot name="title" />
```

父组件使用具名插槽：

```vue
<template #title>标题</template>
```

## 条件、循环、事件

```vue
<span v-if="visible">显示</span>

<li v-for="item in list" :key="item.id">
  {{ item.name }}
</li>

<button :disabled="disabled" @click="handleClick">保存</button>
```

## 动态 class

```vue
<div
  class="tag"
  :class="[
    `tag--${type}`,
    { 'is-disabled': disabled },
  ]"
/>
```

## 透传 attrs

```ts
defineOptions({ inheritAttrs: false })
```

```vue
<button v-bind="$attrs"><slot /></button>
```

## 获取 DOM 元素

```ts
const inputRef = ref<HTMLInputElement | null>(null)

function focusInput() {
  inputRef.value?.focus()
}
```

```vue
<input ref="inputRef" />
```

## 常见文件职责

```text
index.vue / index.tsx  组件实现
types.ts               props 和其他类型
index.scss             样式
*.test.ts              测试
src/index.ts           包导出入口
demo 页面              展示所有用法
```

## 报错时先看什么

| 现象 | 优先检查 |
|---|---|
| 页面空白 | 控制台第一条错误、组件是否导入 |
| props 没生效 | 名字是否一致、是否用了 `:` |
| 点击没反应 | `@click`、函数名、disabled 判断 |
| 父组件收不到事件 | emit 名和监听名是否一致 |
| v-model 不更新 | `modelValue` 和 `update:modelValue` |
| 样式不生效 | class 名、scoped、样式导入 |
| 外部属性丢失 | `$attrs` 是否传给正确元素 |
| 组件无法导入 | 包入口是否 export |

## 提交前一分钟检查

```text
[ ] props 有类型和合理默认值
[ ] 没有直接修改 props
[ ] emit 名称和参数正确
[ ] v-model 数据流完整
[ ] disabled 不只是变灰
[ ] 插槽和 attrs 没被意外丢掉
[ ] 没有无用 ref、computed、import
[ ] demo 覆盖默认和边界状态
[ ] 组件和类型已导出
[ ] 控制台、格式、构建、测试正常
```

