# 08 Design Token 设计与落地

这一课只做一件事：把颜色、圆角、间距、阴影、动效从组件里抽成 **token**，再让一颗按钮通过 token 完成换肤、尺寸切换和状态反馈。

学完你会得到：

- 一套三层 token：原始值 → 语义 → 组件。
- 一个 token 驱动的 `AppButton`，样式里不再写死颜色。
- 三种改 token 的方式：全局、主题、单实例，以及一套暗色主题。
- hover / active / focus / disabled / loading 的完整视觉反馈。
- 一个可以实时调 token、切换明暗主题的演示页。

本课对应文件：

```text
training-project/src/styles/tokens.css                  # token 定义（三层）
training-project/src/components/AppButton/AppButton.vue # 消费 token 的按钮
training-project/src/views/TokenButtonDemo.vue          # 实时调参演示
training-project/src/App.vue                            # 挂载演示页
training-project/src/main.ts                            # 引入 tokens.css
```

---

## 0. 先跑起来

```bash
cd component-demo/training-project
pnpm install        # 或 npm install
pnpm dev            # 或 npm run dev
```

打开页面，找到 **“练习 8：Design Token 按钮”**。这一课所有步骤都围绕它。

页面右上角还有一个 **“切换暗色”** 按钮，它改的是 `<html data-theme>`，后面第 7.4 节会讲。演示面板里也有 **“加载中 loading”** 复选框，对应第 6.5 节。

学习方式仍然是：先读一段，自己敲一段，运行看一眼，再继续下一段。不要一次把文件全部复制完。

---

## 1. Token 到底是什么

先看两段代码。

```css
/* 写法 A：硬编码 */
.button {
  background: #2563eb;
  border-radius: 8px;
}

/* 写法 B：token */
.button {
  background: var(--btn-bg);
  border-radius: var(--btn-radius);
}
```

写法 A 能跑，但会带来三个问题：

1. 想换品牌色，要全局搜索 `#2563eb`，还会误伤“恰好同色”的边框和文字。
2. 想知道这个蓝色是“品牌主色”还是“普通链接色”，只能靠猜。
3. 改圆角时，不知道哪些地方应该一起改、哪些不应该。

Token 的本质不是“CSS 变量”，而是 **给一个设计决定起名字**。值可以变，名字和用途不能乱。

### 三层模型

| 层 | 回答的问题 | 例子 | 谁消费 |
|---|---|---|---|
| 原始值 Primitive | 系统里**有哪些值** | `--blue-600`、`--space-4`、`--radius-lg` | 语义层 |
| 语义层 Semantic | 这个值**扮演什么角色** | `--color-brand`、`--color-text`、`--color-border` | 组件层 |
| 组件层 Component | 这个组件**能调什么** | `--btn-bg`、`--btn-radius`、`--btn-shadow` | 组件自己的样式 |

一条规则贯穿全课：

```text
业务组件只读组件 token
组件 token 只读语义 token
语义 token 才读原始值
```

为什么不让按钮直接用 `--blue-600`？因为换品牌时，你分不清哪些蓝色是“品牌主色”，哪些只是“灰色边框旁边的一点蓝”。语义层存在的意义，就是把“色号”翻译成“用途”。

> 小项目用两层也够。这套训练用三层，是为了让你看清每一层的职责边界。

---

## 2. 先定命名规则

统一格式：

```text
--{层级}-{类别}-{属性}-{状态}
```

例子：

```css
--color-brand              /* 语义：品牌色 */
--color-brand-hover        /* 语义：品牌色悬停态 */
--color-text-muted         /* 语义：次要文字 */
--btn-bg                   /* 组件：按钮背景 */
--btn-bg-hover             /* 组件：按钮悬停背景 */
--btn-focus-ring           /* 组件：按钮聚焦环 */
```

两个命名原则：

- **原始值可以用外观命名**：`--blue-600`、`--slate-200`，因为它只描述值。
- **语义层和组件层必须用用途命名**：`--color-danger`，不要写 `--color-red`；`--btn-bg`，不要写 `--btn-blue`。

反例：

```css
--color1: #2563eb;          /* 不知道是什么 */
--light-blue-button: #3b82f6; /* 换主题时名字就骗人了 */
--btn-big-blue: #2563eb;      /* 把值写进名字，值一变名字就错 */
```

---

## 3. 设计第一层：原始值

打开 `src/styles/tokens.css`，第一段就是原始值层。

这一段只回答“我们系统里有哪些基础值”，不回答“用在哪里”。本课准备了这些类别：

```css
:root {
  /* 色板 */
  --blue-600: #2563eb;
  --red-600: #dc2626;
  --slate-300: #cbd5e1;

  /* 供半透明使用：rgb(var(--blue-rgb) / 0.35) */
  --blue-rgb: 37 99 235;
  --slate-rgb: 15 23 42;

  /* 间距阶梯 */
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-lg: 10px;
  --radius-2xl: 16px;

  /* 字号、字重、阴影、动效 */
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --shadow-md: 0 4px 12px rgb(var(--shadow-color) / 0.1);
  --duration-normal: 180ms;
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

设计原始值时，先问自己四个问题：

1. 品牌主色是什么？悬停、按下时更深还是更浅？
2. 中性色需要几档？（背景、边框、次要文字、主文字）
3. 间距用几档？先定 4 的倍数，不要一上来做 20 档。
4. 圆角、阴影、动效各需要几个层级？

**检查点**：这一段写完后刷新页面，页面应该**完全没变化**。因为还没有组件使用这些变量，这是正常的。

---

## 4. 设计第二层：语义层

语义层是“色号 → 用途”的翻译表。

```css
:root {
  --color-brand: var(--blue-600);
  --color-brand-hover: var(--blue-500);
  --color-brand-active: var(--blue-700);
  --color-brand-soft: var(--blue-50);
  --color-brand-rgb: var(--blue-rgb);
  --color-on-brand: #ffffff;

  --color-danger: var(--red-600);
  --color-danger-hover: var(--red-500);
  --color-danger-active: var(--red-700);

  --color-surface: #ffffff;
  --color-surface-muted: var(--slate-50);
  --color-border: var(--slate-300);
  --color-text: var(--slate-800);
  --color-text-muted: var(--slate-500);

  --radius-control: var(--radius-lg);
  --shadow-control: var(--shadow-sm);
}
```

几个关键决定：

- `--color-brand` 和 `--color-danger` 是**角色**，不是色号。以后换品牌只改右边映射。
- `--color-on-brand` 表示“放在品牌色上面的文字色”，不要直接在组件里写 `#fff`。
- `--color-brand-rgb` 专门给半透明使用：`rgb(var(--color-brand-rgb) / 0.35)`。如果只存 hex，就没法方便地做透明度。
- `--radius-control`、`--shadow-control` 是控件级语义，按钮、输入框可以共用。

**检查点**：在 `src` 里搜索 `#2563eb`，应该只在 `tokens.css` 里出现（演示页里的默认颜色值属于数据，不是样式写死）。

---

## 5. 设计第三层：组件层

组件层是按钮的“可调参数表”。先定契约，再写样式。

| Token | 作用 | 默认来源 |
|---|---|---|
| `--btn-height` | 按钮高度 | 由尺寸类设置 |
| `--btn-padding-x` | 左右内边距 | 由尺寸类设置 |
| `--btn-radius` | 圆角 | `--radius-control` |
| `--btn-bg` | 背景色 | `--color-brand` |
| `--btn-bg-hover` | 悬停背景 | `--color-brand-hover` |
| `--btn-bg-active` | 按下背景 | `--color-brand-active` |
| `--btn-color` | 文字色 | `--color-on-brand` |
| `--btn-border-color` | 边框色 | `transparent` |
| `--btn-shadow` | 默认阴影 | `--shadow-control` |
| `--btn-shadow-hover` | 悬停阴影 | `--shadow-control-hover` |
| `--btn-sheen` | 悬停高光颜色 | 白色半透明 |
| `--btn-focus-ring` | 键盘聚焦环 | 品牌色半透明 |
| `--btn-transition-*` | 动效时长与曲线 | `--duration-normal` |
| `--btn-spinner-size` | loading 指示器尺寸 | `14px` |
| `--btn-spinner-border` | loading 指示器线宽 | `2px` |
| `--btn-spinner-duration` | loading 旋转周期 | `700ms` |

最重要的规则：

> **变体类只做“重映射”，不直接写颜色。**

比如 primary 按钮不是“把背景写成蓝色”，而是：

```css
.app-button--primary {
  --btn-bg: var(--color-brand);
  --btn-bg-hover: var(--color-brand-hover);
  --btn-bg-active: var(--color-brand-active);
  --btn-color: var(--color-on-brand);
}
```

基础样式永远只消费 `--btn-*`：

```css
.app-button {
  background-color: var(--btn-bg);
  color: var(--btn-color);
  border-radius: var(--btn-radius);
  box-shadow: var(--btn-shadow);
}
```

这样新增一个 `--btn-bg` 主题，不需要改基础样式；改品牌色，也不需要动组件。

---

## 6. 改造 AppButton

打开 `src/components/AppButton/AppButton.vue`，按下面四步读和改。

### 6.1 接口：props 只描述“可调项”

```ts
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  block?: boolean
}
```

尺寸和变体都用联合类型，而不是 `string`。这样写错值时 TypeScript 会直接报错，而不是等到页面颜色不对才发现。

`loading` 和 `disabled` 是两个独立状态：`disabled` 表示“这个按钮现在不可用”，`loading` 表示“操作正在进行中”。不要让 `loading` 直接复用 `disabled` 的视觉样式，否则用户分不清是坏了还是在等。

### 6.2 模板：动态 class + 插槽 + 点击

```vue
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
```

两个细节：

- 组件只有一个根元素，所以父组件传的 `class`、`style` 会自动落到 `<button>` 上。演示页就是靠这一点，把 `--btn-radius` 直接注入到按钮实例。
- 这里声明了 `click` 事件并手动 `emit`。如果只声明 `defineEmits` 却不在模板里触发，父组件的 `@click` 会“消失”。这是 Vue 组件很常见的坑。
- `:disabled="disabled || loading"` 直接借用原生 disabled 阻止 loading 期间的重复点击；`aria-busy` 让读屏知道当前正在处理。

### 6.3 基础样式：只认组件 token

```css
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--btn-height);
  padding: 0 var(--btn-padding-x);
  overflow: hidden;
  border: 1px solid var(--btn-border-color);
  border-radius: var(--btn-radius);
  background-color: var(--btn-bg);
  color: var(--btn-color);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  box-shadow: var(--btn-shadow);
  transition:
    background-color var(--btn-transition-duration) var(--btn-transition-ease),
    border-color var(--btn-transition-duration) var(--btn-transition-ease),
    color var(--btn-transition-duration) var(--btn-transition-ease),
    box-shadow var(--btn-transition-duration) var(--btn-transition-ease),
    transform var(--btn-transition-duration) var(--btn-transition-ease);
}
```

不要写 `transition: all`。它会把布局属性也一起动画，后期很难排查。

### 6.4 变体与尺寸：重映射，不重写

```css
.app-button--sm {
  --btn-height: var(--btn-height-sm);
  --btn-padding-x: var(--btn-padding-x-sm);
  --btn-font-size: var(--font-size-sm);
}

.app-button--primary {
  --btn-bg: var(--color-brand);
  --btn-bg-hover: var(--color-brand-hover);
  --btn-bg-active: var(--color-brand-active);
  --btn-color: var(--color-on-brand);
  --btn-shadow:
    0 1px 2px rgb(var(--shadow-color) / 0.18),
    0 4px 12px rgb(var(--color-brand-rgb) / 0.24);
}

.app-button--secondary {
  --btn-bg: var(--color-surface);
  --btn-bg-hover: var(--color-surface-muted);
  --btn-color: var(--color-text);
  --btn-border-color: var(--color-border);
  --btn-sheen: rgb(var(--slate-rgb) / 0.06);
}
```

`danger` 和 `ghost` 同理。你会发现整份组件样式里没有一个业务色号，全部是 token 之间的引用。

**检查点**：页面上的按钮外观基本正常，四种变体、三种尺寸都能切换。

### 6.5 Loading 状态

loading 的视觉只加一个旋转指示器，行为上做三件事：

```vue
<button
  :disabled="disabled || loading"
  :aria-busy="loading || undefined"
>
  <span v-if="loading" class="app-button__spinner" aria-hidden="true" />
  <span class="app-button__label"><slot>按钮</slot></span>
</button>
```

```css
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

.app-button--loading:disabled {
  opacity: 0.9;
  cursor: progress;
  box-shadow: var(--btn-shadow);
}
```

要点：

- 指示器用 `currentColor`，所以 primary、secondary、danger、ghost 四种变体自动适配文字色。
- 尺寸、线宽、转速都走组件 token，不用改组件就能调整 loading 外观。
- loading 的透明度比 disabled 的 `0.55` 高，避免用户误以为按钮坏了。
- 旋转是“功能性动画”，在 `prefers-reduced-motion` 下没有直接删掉，而是把周期放慢一倍。

**检查点**：勾选演示面板的“加载中 loading”，按钮出现转圈、无法重复点击，取消勾选后恢复。

---

## 7. 让 token 可更改：按影响范围选择

Token 真正的价值在“改的时候不用动组件”。按影响范围分三种粒度，最后再用暗色主题把它们串起来。

### 7.1 全局：改整个应用

在 `tokens.css` 之后追加覆盖（同一优先级下后写生效）：

```css
/* src/styles/theme-ocean.css */
:root {
  --color-brand: #0ea5e9;
  --color-brand-hover: #38bdf8;
  --color-brand-active: #0284c7;
  --color-brand-rgb: 14 165 233;
}
```

然后在 `main.ts` 里在 `tokens.css` 之后引入。适合做品牌换肤、活动页主题。

### 7.2 主题：只影响一个区域

```css
[data-theme='sunset'] {
  --color-brand: #ea580c;
  --color-brand-hover: #f97316;
  --color-brand-active: #c2410c;
  --color-brand-rgb: 234 88 12;
}
```

```vue
<main data-theme="sunset">
  <AppButton>保存</AppButton>
</main>
```

只改语义层，组件层会自动跟随。这就是第 5 节“变体只做重映射”的回报。

### 7.3 单实例：只改这一颗按钮

利用 Vue 的 `style` 透传：

```vue
<AppButton :style="{ '--btn-radius': '999px', '--btn-padding-x': '24px' }">
  保存
</AppButton>
```

内联的自定义属性优先级高于 class 里的定义，所以只有这一颗按钮会变。

演示页里，品牌色改的是**语义层**，圆角和内边距改的是**组件层**。你可以观察两者的影响范围差异。

> **关键坑：别名会在定义它的元素上提前解析。**
> 如果你在 `:root` 写 `--btn-bg: var(--color-brand)`，又在某个祖先上改 `--color-brand`，按钮不会跟着变，因为 `--btn-bg` 已经在 `:root` 上算成旧颜色了。
> 本项目的变体类是在按钮元素自己身上写 `--btn-bg: var(--color-brand)`，所以祖先覆盖 `--color-brand` 时，按钮能拿到最新值。

### 7.4 暗色主题：还是只改语义层

`tokens.css` 末尾已经有一套暗色主题。注意它只覆盖语义层，**没有反转 `--blue-600` 这些原始值**：

```css
[data-theme='dark'] {
  color-scheme: dark;

  --color-surface: #111827;
  --color-surface-muted: #1f2937;
  --color-page: #0b1220;
  --color-border: #374151;
  --color-border-strong: #4b5563;
  --color-text: #f3f4f6;
  --color-text-muted: #9ca3af;
  --color-brand-soft: rgb(var(--color-brand-rgb) / 0.16);

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.45);
  --shadow-lg: 0 10px 24px rgb(0 0 0 / 0.5);
}
```

切换时只动根元素：

```ts
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
}
```

为什么这样写：

- 只改语义层，`AppButton` 一行代码都不用动，所有用 `--color-surface`、`--color-text` 的组件自动适配。
- 不反转原始色板。直接反色会让品牌色和危险色一起失真。
- `color-scheme: dark` 会让原生下拉框、复选框、取色器也切到暗色，否则页面暗了、控件还是亮色。
- 主题挂在 `<html>` 上，影响全页；如果只挂在某个按钮内部，就只有那颗按钮变暗。
- `body` 和卡片上加了 `background-color`、`border-color`、`color` 的过渡，切换不会生硬跳变。

**检查点**：点右上角“切换暗色”，页面背景、卡片、文字、边框、下拉框、取色器一起变化；按钮的 hover、聚焦环在暗色下仍然清楚可见。

---

## 8. 视觉效果：状态也交给 token

按钮的视觉反馈集中在这几段：

```css
@media (hover: hover) {
  .app-button:not(:disabled):hover {
    background-color: var(--btn-bg-hover);
    box-shadow: var(--btn-shadow-hover);
    transform: translateY(-1px);
  }
}

.app-button:not(:disabled):active {
  background-color: var(--btn-bg-active);
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
```

逐个解释：

| 状态 | 触发方式 | 视觉变化 | 用到的 token |
|---|---|---|---|
| hover | 鼠标悬停 | 背景变亮/变深、上浮 1px、阴影变大、高光掠过 | `--btn-bg-hover`、`--btn-shadow-hover`、`--btn-sheen` |
| active | 按下 | 背景更深、轻微缩小 | `--btn-bg-active` |
| focus-visible | 键盘 Tab 聚焦 | 外圈聚焦环 | `--btn-focus-ring` |
| disabled | `disabled` 属性 | 降透明度、去阴影、禁止点击 | `opacity` + 原生 disabled |
| loading | `loading` 属性 | 显示旋转指示器、禁止重复点击 | `--btn-spinner-*`、`currentColor` |
| reduced motion | 系统开启“减少动态效果” | 去掉位移动画、放慢旋转 | `@media (prefers-reduced-motion)` |

几个设计理由：

- 用 `:focus-visible` 而不是 `:focus`，鼠标点击不会出现聚焦环，键盘操作仍然可见。
- 高光用 `::after` 绝对定位，不参与布局，不会把按钮撑开。
- hover 放在 `@media (hover: hover)` 里，避免触屏设备点按后 hover 状态“粘住”。
- disabled 保留 token 颜色，只降低透明度。这样禁用状态仍能看出是哪个变体。
- loading 使用比 disabled 更高的透明度，并且用 `cursor: progress`，让“正在处理”和“不可用”看起来不一样。

---

## 9. 调参面板是怎么做的

打开 `src/views/TokenButtonDemo.vue`。核心只有两个 `computed`。

```ts
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
```

然后：

```vue
<section class="token-button-demo" :style="brandVars">
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
</section>
```

- `brandVars` 改的是**语义层**，所以主按钮、ghost 按钮、聚焦环、阴影会一起联动。
- `buttonVars` 改的是**组件层**，所以只影响这一颗按钮。
- `color-mix()` 用来从品牌色派生 hover/active，避免只改一个色导致悬停跳色。
- “加载中 loading”复选框直接透传给 `AppButton`，用来观察 loading 的视觉变化。
- 右上角“切换暗色”改的是 `<html data-theme>`，所以整页一起变，而不是只变一颗按钮。

这个面板不是让你做产品功能，而是学习工具：**先看见 token 的作用范围，再决定项目里该改哪一层。**

---

## 10. 验收清单

完成以下全部，才算这一课过关：

- [ ] `main.ts` 在 `style.css` 之前引入了 `styles/tokens.css`。
- [ ] `AppButton.vue` 的 `<style>` 里没有业务色号（`#2563eb` 这类）。
- [ ] 四种变体 `primary / secondary / danger / ghost` 都能正常显示。
- [ ] 三种尺寸 `sm / md / lg` 的高度、内边距、字号都有变化。
- [ ] 在演示页改品牌色，主按钮、ghost 按钮、hover、聚焦环、阴影一起变化。
- [ ] 在演示页改圆角，只有预览区那一颗按钮变化，其他按钮不变。
- [ ] 鼠标悬停有上浮、阴影和高光；按下有收缩反馈。
- [ ] 用键盘 Tab 能看见聚焦环；鼠标点击不出现聚焦环。
- [ ] 禁用状态下没有悬停效果，也点不动。
- [ ] 勾选 loading 后出现旋转指示器，重复点击无效，取消后恢复。
- [ ] loading 时读屏能通过 `aria-busy` 知道当前正在处理。
- [ ] 点右上角切换暗色后，页面背景、卡片、文字、边框、原生控件一起变化。
- [ ] 暗色下按钮的 hover、聚焦环、loading 指示器仍然清楚可见。
- [ ] 暗色主题只覆盖了语义层，`tokens.css` 的原始色板没有变。
- [ ] 系统开启“减少动态效果”后，按钮不再位移。
- [ ] `npm run build` 通过。

---

## 11. 故意改坏实验

每次只改一个地方，运行看结果，再改回来。

1. **断掉 token 链**
   把 `.app-button` 的 `background-color: var(--btn-bg)` 改成 `background-color: #2563eb`。
   现象：调品牌色时主按钮不再变化。
   结论：组件一旦写死值，token 就失去作用。

2. **只改背景，不改状态**
   在演示页只覆盖 `--btn-bg`，不覆盖 `--btn-bg-hover` / `--btn-bg-active`。
   现象：悬停时突然跳回默认蓝色。
   结论：状态色要成组覆盖，或者用 `color-mix()` 派生。

3. **在 `:root` 上写死组件别名**
   在 `:root` 写 `--btn-bg: var(--color-brand)`，删掉 `.app-button--primary` 里的重映射，再在祖先上改 `--color-brand`。
   现象：按钮不跟随。
   结论：回顾第 7 节的“别名提前解析”。

4. **删掉聚焦样式**
   删除 `:focus-visible` 规则，用 Tab 键走一遍页面。
   现象：键盘用户不知道焦点在哪。
   结论：视觉反馈不只是好看，也是可访问性。

5. **去掉 hover 媒体查询**
   删除 `@media (hover: hover)`，用手机模拟器点按按钮。
   现象：hover 状态可能粘住。
   结论：触屏和鼠标的悬停行为不一样。

6. **把 `transition` 改成 `all`**
   现象：一些你不想动的属性也开始过渡，排查变困难。
   结论：只过渡明确的属性。

7. **暗色主题反转原始色板**
   在 `[data-theme='dark']` 里把 `--blue-600`、`--red-600` 改成浅色。
   现象：品牌色和危险色一起失真，语义层失去意义。
   结论：主题只覆盖语义角色，不动原始值。

8. **loading 不设置 disabled**
   把 `:disabled="disabled || loading"` 改回 `:disabled="disabled"`。
   现象：loading 期间仍可连续点击，可能触发多次请求。
   结论：loading 是“状态 + 行为”的组合，视觉之外还要阻止交互并保留 `aria-busy`。

---

## 12. 进阶练习

按难度递增，任选：

1. **让主题跟随系统并记住选择**
   读 `window.matchMedia('(prefers-color-scheme: dark)')`：首次进入跟随系统，手动切换后写 `localStorage`，刷新时优先读用户选择。思考：系统主题变化时，什么时候应该覆盖用户选择，什么时候不应该。

2. **让 loading 延迟出现**
   网络很快时 spinner 一闪而过反而刺眼。试试请求开始 200ms 后才把 `loading` 设为 true，请求结束清除定时器。思考：为什么这个延迟不应该写死在按钮组件内部。

3. **对照公司 design-system**
   读 `D:\Project\web\web-vue3-ui-dj\packages\design-system`，看真实项目怎么组织颜色、字号、圆角。对比你这套 token 少了哪些类别。

4. **把 token 抽成数据**
   把 `tokens.css` 的值整理成 JSON，思考如何用 Style Dictionary 一类工具生成 CSS / SCSS / TS。先不要求实现，能说清输入输出即可。

5. **做对比度检查**
   给 `--color-on-brand` 和 `--color-brand` 算对比度，正文文字至少 4.5:1。换几个品牌色试试，找出哪些颜色不适合做按钮底色。

6. **加一条 token 规范检查**
   用 stylelint 的 `custom-property-pattern` 限制命名格式，例如必须匹配 `^--(color|space|radius|font|shadow|duration|ease|btn)-`。

---

## 13. 常见坑速查

- **Token 只做了颜色**：间距、圆角、阴影、动效同样值得 token 化，否则换主题仍要改样式。
- **语义层名字写成外观**：`--color-red` 在品牌换成紫色后就是谎言。用 `--color-danger`。
- **组件直接用语义 token**：一开始省事，变体一多就到处写条件判断。组件层是缓冲带。
- **忘了 `:root` 的覆盖顺序**：后引入的样式才生效；同优先级下后写覆盖前写。
- **在 `:root` 写组件别名**：祖先改语义变量时不会重新解析。
- **`outline: none` 却不给替代方案**：键盘用户会失去焦点位置。
- **`transition: all`**：意外动画和性能问题都从这来。
- **声明了 `emit` 却不在模板里触发**：父组件的 `@click` 会失效。
- **只用 opacity 做禁用**：记得同时用原生 `disabled`，否则仍然可以点击。
- **把 loading 做成 disabled 的样子**：用户分不清是坏了还是在等；loading 要有指示器、`cursor: progress` 和更高的透明度。
- **loading 不阻止点击**：只加转圈、不禁用按钮，会重复提交。
- **暗色主题反转原始色板**：品牌色和危险色会一起失真，只覆盖语义层。
- **主题切换只挂在局部容器**：页面其他区域不会跟随；要换整页就挂到 `<html>` 或统一根容器。
- **忘记 `color-scheme`**：页面暗了，原生下拉框、复选框、取色器还是亮色。
- **多根节点组件直接传 `style`**：样式不会自动落到按钮上，需要手动处理 `$attrs`。

---

## 14. 这一课真正要记住的

1. **Token 是命名，不是变量本身。** 名字表达用途，值才可以替换。
2. **三层各司其职。** 原始值提供值，语义层表达角色，组件层暴露可调项。
3. **变体只做重映射。** 组件基础样式永远只消费 `--btn-*`。
4. **改 token 分三种粒度。** 全局换肤、局部主题、单实例微调；暗色主题只是语义层的另一种映射。
5. **视觉效果也要走 token。** hover、active、focus、disabled、loading、动效，都应该是可调的。
6. **状态要成组设计。** loading = 指示器 + 禁止交互 + `aria-busy`；disabled 不等于 loading。

做到这六点，你再看公司 `design-system` 和 `vant-extra` 里的按钮，就能一眼看出：哪些是原始值，哪些是语义映射，哪些是组件自己的参数。
