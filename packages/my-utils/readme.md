# @your-name/my-utils

学习 npm/pnpm 发包用的小工具库。

## 安装

```bash
pnpm add @your-name/my-utils
```

## 使用

```js
import { add, formatDate } from '@your-name/my-utils';
import { subtract } from '@your-name/my-utils/math';

console.log(add(1, 2));       // 3
console.log(subtract(5, 2));  // 3
console.log(formatDate());    // 2026-10-26
```
