# 01 · CSS 基础与选择器

CSS = Cascading Style Sheets(层叠样式表)。它负责网页的**外观**:颜色、大小、位置、间距……

## CSS 规则长什么样
```css
选择器 {
    属性: 值;
    属性: 值;
}
```
例子:
```css
p {
    color: red;        /* 文字颜色红 */
    font-size: 16px;   /* 字号 16 像素 */
}
```
- **选择器**:选中哪些元素(这里是所有 `<p>`)。
- **声明**:`属性: 值;`,每条以分号 `;` 结尾。
- 大括号 `{}` 包住所有声明。

## 三种引入 CSS 的方式
### 1. 内联样式(写在标签的 style 属性里)
```html
<p style="color:red;">红字</p>
```
最不推荐:样式和结构混在一起,难维护。偶尔快速调试用。

### 2. 内部样式(写在 head 的 `<style>` 里)
```html
<head>
    <style>
        p { color: red; }
    </style>
</head>
```
适合单个页面的小 demo(本课示例就用这种)。

### 3. 外部样式(单独的 .css 文件,用 link 引入)★推荐
```html
<head>
    <link rel="stylesheet" href="style.css">
</head>
```
真实项目都这么做:HTML 管结构,CSS 单独一个文件管样式,清清爽爽。

## 选择器(核心中的核心)
| 选择器 | 写法 | 选中谁 |
|--------|------|--------|
| 标签选择器 | `p { }` | 所有 `<p>` |
| **class 选择器** | `.note { }` | 所有 `class="note"` 的元素 |
| id 选择器 | `#title { }` | `id="title"` 的元素(页面唯一) |
| 后代选择器 | `.box span { }` | `.box` 内部的所有 `span` |
| 群组选择器 | `h2, h3 { }` | 所有 `h2` 和 `h3` |
| 通配符 | `* { }` | 所有元素 |

### 最重要的是 class 选择器!
真实项目 99% 靠 **class** 来上样式。HTML 里写:
```html
<div class="card">...</div>
```
CSS 里写:
```css
.card { ... }
```
一个元素可以有多个 class:`<div class="card big red">`,空格隔开。

这就是为什么看别人代码时满屏 `class="xxx"`——**认识 class,就是看懂前端项目的关键**。

## 伪类:元素的特殊状态
```css
a:hover { color: red; }   /* 鼠标悬停 */
input:focus { ... }       /* 输入框聚焦 */
```

## 层叠与优先级(先有印象)
多条规则冲突时,谁生效?优先级大致:
**内联 style > id 选择器 > class 选择器 > 标签选择器**
后面写的会覆盖前面同级的。这套规则就是 "Cascading(层叠)" 的含义。

## 动手
打开 `01-demo.html`,对照每个选择器看效果。试着:
1. 新加一个 class `.big { font-size: 30px; }`,用到某个段落上。
2. 给一个元素同时加两个 class,观察效果叠加。
