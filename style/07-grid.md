# 07 · Grid 网格布局

Flex 擅长**一维**(一行或一列)排列;Grid 擅长**二维**(行 + 列同时控制),做整齐的网格、复杂的页面布局特别顺手。

## 开启 Grid
```css
.container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;  /* 三列,每列等宽 */
    gap: 16px;                            /* 行列间距 */
}
```
子元素会自动按顺序填进这些格子,排满一行自动换到下一行。

## 关键属性:定义列
```css
grid-template-columns: 200px 200px 200px; /* 三列,每列 200px */
grid-template-columns: 1fr 2fr;           /* 两列,宽度比 1:2 */
grid-template-columns: repeat(3, 1fr);    /* 重复:等于 1fr 1fr 1fr */
```

### fr 单位
`fr` = fraction(份额),按比例分配剩余空间。`1fr 1fr 1fr` 就是三等分,比手算百分比方便太多。

### ★ 响应式网格神器(不用媒体查询就能自适应!)
```css
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
```
含义:每列最小 200px,能塞几列塞几列,宽度自动均分。**窗口变宽自动增列,变窄自动减列**——做商品列表、图片墙的黄金写法,记下来。

## 定义行(可选)
```css
grid-template-rows: 100px 200px;  /* 第一行100,第二行200 */
```
通常行高让内容自己撑,不用特意设。

## 让某个格子跨多列 / 多行
```css
.item {
    grid-column: span 2;  /* 横向占 2 列 */
    grid-row: span 2;     /* 纵向占 2 行 */
}
```
做"大图占两格、小图占一格"的杂志式布局就靠它。

## Grid vs Flex 怎么选?
| 需求 | 用谁 |
|------|------|
| 一行菜单、一排按钮、简单居中 | **Flex** |
| 整齐的卡片/图片网格 | **Grid** |
| 整页布局(头/侧/主/脚) | **Grid**(或两者混用) |
一句话:**一个方向用 Flex,两个方向用 Grid。** 实际项目常常两个一起用,不冲突。

## 整页布局示例(Grid 的拿手好戏)
```css
.layout {
    display: grid;
    grid-template-columns: 200px 1fr;  /* 左侧边栏固定,右主区自适应 */
    grid-template-rows: auto 1fr auto;  /* 头、身、脚 */
    gap: 10px;
}
```

## 动手
打开 `07-demo.html`。试着:
1. 把 `repeat(3, 1fr)` 改成 `repeat(4, 1fr)`,变四列。
2. **重点**:缩放浏览器窗口宽度,观察 `auto-fill + minmax` 那组网格自动增减列数。
3. 给某个卡片加 `grid-column: span 2` 让它变宽。
