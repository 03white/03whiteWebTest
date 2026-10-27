# 06 · Flexbox 弹性布局(最常用!)

**这是现代布局的主力工具。** 学会 Flex,横向排列、居中、等分空间这些日常需求都能轻松搞定。真实项目里到处都是它。

## 核心概念:一个容器 + 一排子项
给一个容器加 `display: flex`,它的**直接子元素**就自动变成"弹性项目",默认横向排成一行:
```css
.container { display: flex; }
```
```html
<div class="container">
    <div>子1</div>
    <div>子2</div>
    <div>子3</div>
</div>
```

记住两个角色:
- **容器(父)**:加 `display:flex`,控制整体排布。
- **项目(子)**:被排布的元素,可微调自己。

还有两根轴:
- **主轴**:默认水平(→)。
- **交叉轴**:默认垂直(↓)。

## 容器上的属性(最常用)
### flex-direction:主轴方向
```css
flex-direction: row;    /* 默认,横向 → */
flex-direction: column; /* 纵向 ↓ */
```

### justify-content:主轴上怎么排(最常用!)
```css
justify-content: flex-start;    /* 靠左(默认) */
justify-content: center;        /* 居中 */
justify-content: flex-end;      /* 靠右 */
justify-content: space-between; /* 两端对齐,中间均分间隔 */
justify-content: space-around;  /* 每项两侧均等间隔 */
```
`space-between` 超好用:导航栏"logo 在左、菜单在右"一行搞定。

### align-items:交叉轴上怎么对齐
```css
align-items: stretch;    /* 默认,拉伸填满 */
align-items: center;     /* 垂直居中 */
align-items: flex-start; /* 顶部对齐 */
```

### ★ 万能居中(新手最爱)
让一个元素在容器里**水平垂直都居中**,以前是老大难,现在:
```css
.container {
    display: flex;
    justify-content: center;  /* 水平居中 */
    align-items: center;      /* 垂直居中 */
}
```
**这三行请背下来**,用途极广。

### flex-wrap:换行
```css
flex-wrap: wrap;  /* 一行放不下就换行(做卡片墙必备) */
```

### gap:项目之间的间距
```css
gap: 20px;  /* 子项之间留 20px,比用 margin 方便多了 */
```

## 项目上的属性
### flex:如何分配剩余空间
```css
.item { flex: 1; }  /* 所有项 flex:1 → 平均等分宽度 */
```
- 三个子项都 `flex:1` → 各占 1/3。
- 一个 `flex:2` 其余 `flex:1` → 那个占一半。
做"两栏/三栏等分""侧边栏固定+主区自适应"全靠它。

## 典型场景速查
| 想要 | 怎么写 |
|------|--------|
| 横向排列 | 容器 `display:flex` |
| 整体居中 | `justify-content:center; align-items:center;` |
| 两端对齐(导航) | `justify-content:space-between` |
| 等分宽度 | 每个子项 `flex:1` |
| 卡片自动换行 | `flex-wrap:wrap` + `gap` |

## 动手
打开 `06-demo.html`,改容器的 `justify-content` 值(center/space-between/space-around),实时看子项怎么重排。再把某个子项设 `flex:2` 看它变宽。
