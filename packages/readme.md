# npm / pnpm 发包与用包实验手册

> 目标：把一个自己写的 JS 包完整走一遍 **编写 → 打包 → 发布 → 安装 → 升级 → 废弃/下架** 的流程。
>
> 环境：本手册按 **Node 24 / npm 11 / pnpm 11** 编写。所有实验都在 `packages/` 目录下完成，不会动仓库里的其他学习目录。
>
> 建议顺序：实验一 → 实验二 → 实验三（本地仓库）→ 实验四（可选，公网）→ 实验五（可选，公司仓库）→ 实验六 → 实验七 → 实验八 → 实验九（可选）。每个实验末尾都有 **验收标准**。

## 目录

- [0. 先看懂全局流程](#0-先看懂全局流程)
- [1. 六个必须搞懂的概念](#1-六个必须搞懂的概念)
- [2. 实验环境检查](#2-实验环境检查)
- [3. 目录规划](#3-目录规划)
- [4. 实验一：写一个可发布的包](#4-实验一写一个可发布的包)
- [5. 实验二：发布前先在本地用起来](#5-实验二发布前先在本地用起来)
- [6. 实验三：搭一个本地 registry（推荐的第一次发布）](#6-实验三搭一个本地-registry推荐的第一次发布)
- [7. 实验四：发布到 npm 公网（可选）](#7-实验四发布到-npm-公网可选)
- [8. 实验五：发布到公司私有仓库（可选）](#8-实验五发布到公司私有仓库可选)
- [9. 实验六：在业务项目里安装、升级、锁定版本](#9-实验六在业务项目里安装升级锁定版本)
- [10. 实验七：预发布与 dist-tag](#10-实验七预发布与-dist-tag)
- [11. 实验八：pnpm workspace 多包管理](#11-实验八pnpm-workspace-多包管理)
- [12. 实验九：自动化发布（可选）](#12-实验九自动化发布可选)
- [13. 包的治理：deprecate 与 unpublish](#13-包的治理deprecate-与-unpublish)
- [14. 常见报错速查](#14-常见报错速查)
- [15. 命令速查](#15-命令速查)
- [16. 最终验收清单与清理](#16-最终验收清单与清理)

---

## 0. 先看懂全局流程

```text
┌──────────────┐  npm pack   ┌──────────────────┐  npm publish  ┌─────────────────┐
│  你的源码     │ ──────────> │ .tgz 压缩包       │ ────────────> │     registry    │
│  my-utils/   │             │ package.json     │               │ npmjs / Verdaccio│
│              │             │ + files 白名单    │               │  / Artifactory  │
└──────────────┘             └──────────────────┘               └────────┬────────┘
                                                                        │ pnpm add
                                                                        v
                                                              ┌──────────────────┐
                                                              │   node_modules   │
                                                              │   + 你的业务代码  │
                                                              └──────────────────┘
```

关键点：

1. `package.json` 描述这个包（叫什么、什么版本、入口在哪、发布哪些文件）。
2. `npm pack` / `pnpm pack` 会打出一个 `.tgz`，**只有打进 tgz 的文件才会被发布**。
3. `publish` 是把 tgz 上传到某个 **registry（仓库）**，不是上传到 GitHub。
4. 别人安装时，是从 registry 下载 tgz，解压到 `node_modules`。

> 本手册里的“仓库”指 npm registry（包仓库），不是 Git 仓库。

---

## 1. 六个必须搞懂的概念

| 概念 | 说明 | 本次实验里的例子 |
|------|------|------------------|
| registry | 包仓库的地址 | 官方 `https://registry.npmjs.org/`；本地 `http://localhost:4873` |
| 包名 / scope | 包的唯一名字。`@scope/name` 叫作用域包 | `@your-name/my-utils` |
| version | 语义化版本 `major.minor.patch` | `0.1.0`、`1.2.3`、`2.0.0-beta.0` |
| tarball | 真正被上传的 `.tgz` 文件 | `your-name-my-utils-0.1.0.tgz` |
| dist-tag | 版本之上的“别名”，默认是 `latest` | `latest`、`beta`、`next` |
| lockfile | 锁定实际安装版本的清单 | `pnpm-lock.yaml`（要提交到 Git） |

### 1.1 语义化版本（semver）

版本号格式：`主版本.次版本.修订号`，例如 `1.4.2`。

| 变化 | 什么时候 +1 | 例子 |
|------|-------------|------|
| major | 不兼容的改动 | `1.4.2 → 2.0.0` |
| minor | 向下兼容的新功能 | `1.4.2 → 1.5.0` |
| patch | 向下兼容的修 bug | `1.4.2 → 1.4.3` |

依赖版本范围：

| 写法 | 含义 | 允许升级到 |
|------|------|-----------|
| `1.4.2` | 精确版本 | 只装 `1.4.2` |
| `^1.4.2` | 兼容主版本 | `>=1.4.2 <2.0.0` |
| `~1.4.2` | 兼容次版本 | `>=1.4.2 <1.5.0` |
| `*` / `latest` | 任意最新 | 不推荐在生产使用 |

注意 `0.x` 阶段的特殊性：`^0.1.2` 只允许 `0.1.x`，不会升到 `0.2.0`。第一次发包通常从 `0.1.0` 开始。

### 1.2 包名与 scope

- 不带 scope：`my-utils`，必须**全网唯一**，而且很容易被占用。
- 带 scope：`@your-name/my-utils`，`your-name` 一般是你的 npm 用户名或公司组织名。
- scope 包发布到公网时默认是私有的，免费账号需要显式加 `--access public` 才能公开。

> 实验中请把所有 `@your-name/` 替换成你自己的 npm 用户名（小写、可带连字符）。

---

## 2. 实验环境检查

在 `packages/` 下打开终端，执行：

```bash
node -v
npm -v
pnpm -v

npm config get registry
pnpm config get registry

npm whoami
```

**预期结果**：Node 24.x、npm 11.x、pnpm 11.x；registry 是 `https://registry.npmjs.org/`（或公司镜像）；`npm whoami` 没登录时会报 `ENEEDAUTH`，这是正常的。

> 安全提示：你的用户级配置文件 `~/.npmrc` 里可能已经保存了公司仓库的认证 token。
> **不要把它复制进仓库、不要截图、不要提交到 Git。** 本实验优先使用“项目级 `.npmrc`”，避免污染全局配置。

---

## 3. 目录规划

实验结束后目录大致如下（`lab-workspace/` 和 `mono/` 是后面的可选实验）：

```text
packages/
├─ readme.md              # 本文件
├─ my-utils/              # 我们要发布的包
│  ├─ package.json
│  ├─ README.md
│  ├─ LICENSE
│  ├─ .npmrc              # 仅本地 registry 实验时创建
│  └─ src/
│     ├─ index.js
│     ├─ index.d.ts
│     ├─ math.js
│     └─ math.d.ts
├─ playground/            # 使用包的业务项目
│  ├─ package.json
│  ├─ .npmrc              # 仅本地 registry 实验时创建
│  └─ src/main.js
└─ mono/                  # 实验八：workspace 多包（可选）
```

`my-utils` 和 `playground` 是两个独立项目，各自执行 `pnpm install`。这样能真实验证“发布后用包”的流程。

---

## 4. 实验一：写一个可发布的包

### 4.1 创建目录和 package.json

```bash
mkdir my-utils
cd my-utils
pnpm init
```

把生成的 `package.json` 整个替换成下面内容：

```json
{
  "name": "@your-name/my-utils",
  "version": "0.1.0",
  "description": "Learning npm/pnpm publish: a tiny utility library",
  "type": "module",
  "main": "./src/index.js",
  "module": "./src/index.js",
  "types": "./src/index.d.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "default": "./src/index.js"
    },
    "./math": {
      "types": "./src/math.d.ts",
      "default": "./src/math.js"
    }
  },
  "files": [
    "src"
  ],
  "sideEffects": false,
  "engines": {
    "node": ">=20.19"
  },
  "keywords": [
    "demo",
    "learning",
    "utils"
  ],
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

### 4.2 关键字段说明

| 字段 | 作用 | 新手常见坑 |
|------|------|-----------|
| `name` | 包名，也是别人 `import` 的名字 | 公网必须唯一；scope 名要匹配你的账号/组织 |
| `version` | 当前版本 | 已发布的版本不能覆盖，只能发新版本 |
| `private` | `true` 时禁止发布 | 业务项目一定要加 `"private": true`，防止误发 |
| `type` | `module` 表示 `.js` 按 ESM 解析 | 和 `require` 混用要注意兼容性 |
| `main` | 旧工具/旧版 Node 的默认入口（没有 `exports` 时使用） | 新包建议同时提供 `exports` |
| `module` | 打包工具（webpack/vite）识别的 ESM 入口 | 不是 Node 官方字段 |
| `types` | TypeScript 类型入口 | 路径写错会提示“找不到类型声明” |
| `exports` | 精确控制“哪些路径可以被 import” | 没写 `./xxx` 时，子路径 import 会报 `ERR_PACKAGE_PATH_NOT_EXPORTED` |
| `files` | 发布白名单 | 不写会把测试、配置、源码以外的东西也发出去 |
| `sideEffects` | 告诉打包工具能否 tree-shaking | 纯工具库设为 `false` |
| `engines` | 声明 Node 版本要求 | 老项目安装时会提示不兼容 |
| `publishConfig` | 发布时的默认配置 | `access: public` 可省掉每次加 `--access public` |

`package.json` 里**不要写注释**，JSON 不支持注释。

### 4.3 写源码

新建 `src/math.js`：

```js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

新建 `src/index.js`：

```js
export { add, subtract } from './math.js';

export function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
```

新建 `src/math.d.ts`：

```ts
export declare function add(a: number, b: number): number;
export declare function subtract(a: number, b: number): number;
```

新建 `src/index.d.ts`：

```ts
export { add, subtract } from './math.js';
export declare function formatDate(date?: Date): string;
```

先在本地直接跑一下：

```bash
node -e "import('./src/index.js').then(m => console.log(m.add(1, 2), m.formatDate(new Date('2026-01-02'))))"
```

**预期结果**：输出 `3 2026-01-02`。

### 4.4 给包写 README 和 LICENSE

发布到 registry 后，包页面展示的是**包自己的 README**，不是仓库根目录的 README。

新建 `my-utils/README.md`：

````markdown
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
````

新建 `my-utils/LICENSE`（MIT 示例，把年份和名字改掉）：

```text
MIT License

Copyright (c) 2026 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 4.5 检查“到底会发布哪些文件”（非常重要）

```bash
npm pack --dry-run
```

**预期结果**：`Tarball Contents` 里只有这些文件：

```text
LICENSE
README.md
package.json
src/index.d.ts
src/index.js
src/math.d.ts
src/math.js
```

如果看到了 `node_modules/`、`.env`、测试文件、构建缓存，说明 `files` 或忽略规则有问题。

说明：

- `package.json`、`README`、`LICENSE` 以及 `main` 指向的文件**总是会被包含**。
- `files` 是白名单；写 `["src"]` 时，`src` 之外的文件不会发布。
- 也可以用 `.npmignore` 做黑名单，但**`files` 白名单更安全**，两者同时存在时 `files` 优先。
- `.npmrc`、`node_modules`、`.git` 等默认不会进 tgz。

### 4.6 真正打一个 tgz 看看

```bash
pnpm pack
```

**预期结果**：当前目录多出一个 `.tgz` 文件，命令会打印文件名。可以查看内容：

```bash
tar -tf your-name-my-utils-0.1.0.tgz
```

> 实际文件名以命令输出为准（scope 包通常会把 `@scope/` 变成 `scope-`）。

### 4.7 验收标准

- [ ] `npm pack --dry-run` 的文件列表符合预期
- [ ] `node -e "import('./src/index.js')..."` 能正常执行
- [ ] 能说清楚 `main`、`exports`、`files` 各自的作用
- [ ] `package.json` 是合法 JSON，没有注释和尾随逗号

---

## 5. 实验二：发布前先在本地用起来

真实开发中不会“写完就直接发”，而是先在本地验证。有三种常用方式。

### 5.1 创建 playground

```bash
cd ..
mkdir playground
cd playground
pnpm init
```

把 `playground/package.json` 替换成：

```json
{
  "name": "playground",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/main.js"
  }
}
```

新建 `playground/src/main.js`：

```js
import { add, formatDate } from '@your-name/my-utils';
import { subtract } from '@your-name/my-utils/math';

console.log('add:', add(1, 2));
console.log('subtract:', subtract(5, 2));
console.log('date:', formatDate(new Date('2026-01-02')));
```

### 5.2 方式 A：`file:` 依赖（最快）

```bash
cd playground
pnpm add file:../my-utils
pnpm start
```

**预期结果**：输出 `add: 3`、`subtract: 3`、`date: 2026-01-02`。

查看 `playground/package.json`，会看到：

```json
{
  "dependencies": {
    "@your-name/my-utils": "file:../my-utils"
  }
}
```

现在去改 `my-utils/src/math.js`，把 `add` 改成 `return a + b + 1;`，再执行 `pnpm start`。

**预期结果**：输出立刻变成 `add: 4`。因为 pnpm 对目录型的 `file:` 依赖做的是**软链接**，源码修改会实时生效。

改回原样。

### 5.3 方式 B：`pnpm link`（适合长期联调）

在 `playground/` 里执行：

```bash
pnpm remove @your-name/my-utils
pnpm link ../my-utils
pnpm start
```

**预期结果**：同样能跑通。`package.json` 里会多出 `"link:../my-utils"`。

取消链接（连同 `package.json` 里的 `link:` 依赖一起移除）：

```bash
pnpm remove @your-name/my-utils
```

> `pnpm unlink` 只解除链接，依赖项可能还留在 `package.json` 里；想彻底移除用 `pnpm remove`。

### 5.4 方式 C：安装 tgz（最接近真实发布）

```bash
cd playground
pnpm remove @your-name/my-utils
pnpm add ../my-utils/your-name-my-utils-0.1.0.tgz
pnpm start
```

**预期结果**：能跑通。这种方式会把包**复制**进 `node_modules`，所以再改 `my-utils/src` 里的源码，`playground` 不会自动变化。必须重新 `pnpm pack` 并重新安装。

### 5.5 三种方式对比

| 方式 | 源码改动是否实时生效 | 是否走 `files` 白名单 | 适用场景 |
|------|-------------------|---------------------|----------|
| `file:../my-utils` | 是（软链接） | 否 | 日常本地联调 |
| `pnpm link ../my-utils` | 是（软链接） | 否 | 长期联调 |
| 安装 `.tgz` | 否 | 是 | 发布前最终验证 |

> 注意：`file:` / `link:` 只适合本地。**不要发布一个依赖里带 `file:` / `link:` 的包**，别人安装会找不到路径。

### 5.6 验收标准

- [ ] 三种本地方式都能跑通
- [ ] 能观察到 `file:`/`link:` 修改源码立即生效
- [ ] 能观察到 tgz 方式修改源码不生效，必须重新打包安装
- [ ] 能说清楚“软链接调试”和“真实 tgz 安装”的区别

---

## 6. 实验三：搭一个本地 registry（推荐的第一次发布）

直接往公网发有心理负担，也容易把试验包污染到 npmjs。最安全的做法是本地起一个 [Verdaccio](https://verdaccio.org/)。

### 6.1 启动 Verdaccio

新开一个终端（保持它一直运行）：

```bash
pnpm dlx verdaccio
```

**预期结果**：终端打印类似 `warn --- http address - http://localhost:4873/`，并提示配置文件和存储目录位置。浏览器打开 <http://localhost:4873> 能看到 Verdaccio 页面。

### 6.2 注册本地仓库账号

再开一个终端：

```bash
npm adduser --registry http://localhost:4873 --auth-type=legacy
npm whoami --registry http://localhost:4873
```

按提示输入用户名、密码、邮箱（邮箱随便填一个合法格式即可）。

**预期结果**：`npm whoami` 输出你刚注册的用户名。

> 为什么加 `--auth-type=legacy`：npm 9+ 默认走网页登录，Verdaccio 这种自建仓库需要传统的用户名/密码方式。

### 6.3 让本次实验使用本地仓库

新建 `my-utils/.npmrc`：

```ini
registry=http://localhost:4873
```

新建 `playground/.npmrc`：

```ini
registry=http://localhost:4873
```

> 这两个文件只影响当前项目，不会改你的全局 `~/.npmrc`。
> 认证 token 由 `npm adduser` 写入用户级配置，项目里不需要写密码。

### 6.4 发布到本地仓库

```bash
cd my-utils
pnpm publish --access public --no-git-checks
```

**预期结果**：输出类似：

```text
@your-name/my-utils@0.1.0 → http://localhost:4873/
Published package @your-name/my-utils@0.1.0
```

参数说明：

- `--access public`：scope 包公开。本地仓库其实不校验这个，但养成习惯。
- `--no-git-checks`：不检查 Git 分支、工作区是否干净。学习仓库经常有未提交文件，先跳过。

验证：

```bash
npm view @your-name/my-utils versions --registry http://localhost:4873
```

**预期结果**：输出包含 `0.1.0`。也可以直接在 Verdaccio 网页里看到这个包。

### 6.5 在 playground 里从“仓库”安装

```bash
cd ../playground
pnpm remove @your-name/my-utils
pnpm add @your-name/my-utils
pnpm start
```

**预期结果**：输出 `add: 3`、`subtract: 3`、`date: 2026-01-02`。

注意：这次安装走的是 `playground/.npmrc` 里的本地 registry，`package.json` 里会写成版本范围（例如 `^0.1.0`），而不是 `file:`。

验证锁文件：

```bash
pnpm list @your-name/my-utils
```

**预期结果**：显示 `@your-name/my-utils 0.1.0`。

### 6.6 模拟一次真实升级

1. 修改 `my-utils/src/math.js`，比如给 `add` 加一行 `console.log('v0.1.1')`。
2. 提升版本号：

```bash
cd ../my-utils
pnpm version patch --no-git-tag-version
```

**预期结果**：`package.json` 的 `version` 从 `0.1.0` 变成 `0.1.1`。

3. 重新发布：

```bash
pnpm publish --no-git-checks
```

**预期结果**：输出 `Published package @your-name/my-utils@0.1.1`。

4. 回到 playground 升级：

```bash
cd ../playground
pnpm outdated
pnpm update @your-name/my-utils
pnpm list @your-name/my-utils
pnpm start
```

**预期结果**：

- `pnpm outdated` 能看到 `0.1.0 → 0.1.1`。
- 升级后版本变成 `0.1.1`。
- 运行输出里出现 `v0.1.1`。

### 6.7 切回官方源（重要）

实验结束后，删除 `my-utils/.npmrc` 和 `playground/.npmrc`，否则以后安装包还会去 `localhost:4873`：

```powershell
# 在 packages/ 下执行
Remove-Item my-utils/.npmrc, playground/.npmrc
```

然后重新安装，确认回到官方源：

```bash
cd playground
pnpm remove @your-name/my-utils
pnpm install
```

> 如果切换 registry 后出现版本混乱，删除 `node_modules/` 和 `pnpm-lock.yaml` 再 `pnpm install`。
>
> 本地仓库的数据默认在 Verdaccio 的存储目录里；想清空就停掉 Verdaccio 后删除该目录（启动日志里会打印路径）。

### 6.8 验收标准

- [ ] Verdaccio 能启动并访问 <http://localhost:4873>
- [ ] 能成功 `adduser` 并 `whoami`
- [ ] `pnpm publish` 成功，`npm view` 能看到版本
- [ ] playground 能从本地 registry 安装并运行
- [ ] 能完成一次 `0.1.0 → 0.1.1` 的发布 + 升级
- [ ] 实验后能清理 `.npmrc` 并切回官方源

---

## 7. 实验四：发布到 npm 公网（可选）

> 这一步会真的把包发到公网，**包名要先确认没被占用**。如果只是练习，建议继续用本地 Verdaccio，或者发一个明显带个人前缀的试验包。

### 7.1 准备

1. 注册并验证邮箱：<https://www.npmjs.com/signup>
2. 建议开启 2FA。
3. 确认包名可用：

```bash
npm view @your-name/my-utils version
```

**预期结果**：返回 `E404` 通常表示“这个名字还没人发”（scope 已存在但包不存在时也是 404）。如果返回了版本号，说明名字已被占用，换一个。

### 7.2 登录

```bash
npm login
npm whoami
```

**预期结果**：`npm whoami` 输出你的 npm 用户名。

> 如果公司配置了 scope 镜像，注意不要让 `@your-name` 被路由到公司仓库。
> 发布前显式确认目标仓库：`npm config get registry`。

### 7.3 发布

先删掉本地实验用的 `my-utils/.npmrc`，然后：

```bash
cd my-utils
pnpm publish --access public --no-git-checks
```

因为 `package.json` 里已经有 `"publishConfig": { "access": "public" }`，所以 `--access public` 可以省略。

**预期结果**：

```text
@your-name/my-utils@<当前 version> → https://registry.npmjs.org/
Published package @your-name/my-utils@<当前 version>
```

> 如果你已经完成了实验三，当前版本可能已经是 `0.1.1`，以 `package.json` 里的 `version` 为准。
> 如果提示版本已存在，先 `pnpm version patch --no-git-tag-version` 再发布。

如果开了 2FA，命令会要求输入一次性验证码，或者加 `--otp 123456`。

### 7.4 验证

```bash
npm view @your-name/my-utils
npm view @your-name/my-utils versions
```

打开 `https://www.npmjs.com/package/@your-name/my-utils` 应该能看到包页面和包自己的 README。

在 playground 里删除本地 `.npmrc`，然后：

```bash
cd ../playground
pnpm remove @your-name/my-utils
pnpm add @your-name/my-utils
pnpm start
```

**预期结果**：能从公网安装并运行。

### 7.5 验收标准

- [ ] 包名可用，登录成功
- [ ] 公网发布成功，网页能看到
- [ ] 能从公网安装到 playground
- [ ] 能说明 `--access public` 和 `publishConfig.access` 的关系

---

## 8. 实验五：发布到公司私有仓库（可选）

公司一般用 Artifactory / Nexus / Verdaccio。核心逻辑和公网一样，区别是 **registry 地址** 和 **认证 token**。

### 8.1 两种指定 registry 的方式

**方式 A：按 scope 路由（推荐）**

在项目的 `.npmrc` 里写：

```ini
@company:registry=https://npm.example.com/repository/npm-hosted/
//npm.example.com/repository/npm-hosted/:_authToken=${NPM_TOKEN}
```

然后包名必须是 `@company/xxx`，例如 `@company/my-utils`。

**方式 B：在 package.json 里强制指定**

```json
{
  "name": "@company/my-utils",
  "publishConfig": {
    "registry": "https://npm.example.com/repository/npm-hosted/",
    "access": "restricted"
  }
}
```

### 8.2 设置 token（不要把 token 写进 Git）

PowerShell 当前会话临时设置：

```powershell
$env:NPM_TOKEN = "你的公司仓库 token"
```

`.npmrc` 里用 `${NPM_TOKEN}` 引用，不要直接写明文。

发布前确认：

```bash
npm ping --registry https://npm.example.com/repository/npm-hosted/
npm whoami --registry https://npm.example.com/repository/npm-hosted/
```

然后发布：

```bash
pnpm publish --no-git-checks
```

> 如果包名以**已经写在 `~/.npmrc` 里的公司 scope** 开头，该 scope 会自动路由到对应公司仓库。
> 发包前用 `npm config get @company:registry` 确认目标地址，避免把试验包发错地方。
> 本手册不会读取或展示你的用户级 token；实验时也请不要把它复制到任何文件里。

### 8.3 在业务项目里安装

业务项目的 `.npmrc` 同样需要 scope 路由和 token：

```ini
@company:registry=https://npm.example.com/repository/npm-hosted/
//npm.example.com/repository/npm-hosted/:_authToken=${NPM_TOKEN}
```

然后：

```bash
pnpm add @company/my-utils
```

### 8.4 验收标准

- [ ] 能确认 scope 对应的 registry 地址
- [ ] token 通过环境变量注入，没有提交到 Git
- [ ] 发布和安装都成功
- [ ] 能区分“公网 scope”和“公司 scope”的路由

---

## 9. 实验六：在业务项目里安装、升级、锁定版本

### 9.1 安装的几种写法

```bash
# 最新版（写入 ^x.y.z）
pnpm add @your-name/my-utils

# 精确版本
pnpm add @your-name/my-utils@0.1.0

# 指定范围
pnpm add @your-name/my-utils@^0.1.0

# 指定 dist-tag（下一节会用到）
pnpm add @your-name/my-utils@beta
```

### 9.2 使用子路径导出

`package.json` 里声明了：

```json
{
  "exports": {
    "./math": {
      "types": "./src/math.d.ts",
      "default": "./src/math.js"
    }
  }
}
```

所以可以这样用：

```js
import { add } from '@your-name/my-utils';
import { subtract } from '@your-name/my-utils/math';
```

如果没有声明 `./math`，第二行会报 `ERR_PACKAGE_PATH_NOT_EXPORTED`。

### 9.3 查看、升级、锁定

```bash
pnpm list @your-name/my-utils
pnpm outdated
pnpm update
pnpm update --latest
pnpm why @your-name/my-utils
```

说明：

- `pnpm update`：按 `package.json` 里的范围升级。
- `pnpm update --latest`：无视范围，直接升到最新（可能跨 major，慎用）。
- `pnpm why`：查这个包被谁依赖。
- `pnpm-lock.yaml` **要提交到 Git**；CI 用 `pnpm install --frozen-lockfile` 保证可复现。

### 9.4 统一覆盖依赖版本（可选）

如果间接依赖版本冲突，可以在 `package.json` 里加：

```json
{
  "pnpm": {
    "overrides": {
      "@your-name/my-utils": "0.1.1"
    }
  }
}
```

然后重新 `pnpm install`。

### 9.5 验收标准

- [ ] 能安装、升级、查看版本
- [ ] 能解释 `^` 和 `~` 的区别
- [ ] 能使用 `@your-name/my-utils/math` 子路径
- [ ] 知道 `pnpm-lock.yaml` 要提交，`node_modules` 不提交

---

## 10. 实验七：预发布与 dist-tag

场景：新版本还没测稳，不想让 `pnpm add pkg` 默认装到它。

> 本节需要先确定发布目标：继续用本地 Verdaccio，就在 `my-utils/` 和 `playground/` 重新创建指向 `http://localhost:4873` 的 `.npmrc`；用公网则先 `npm login`。发布前用 `npm config get registry` 确认地址。

### 10.1 发一个 beta

```bash
cd my-utils
pnpm version prerelease --preid beta --no-git-tag-version
```

如果当前是 `0.1.1`，会变成 `0.1.2-beta.0`。

发布时指定 tag：

```bash
pnpm publish --tag beta --no-git-checks
```

**关键**：这里如果不加 `--tag beta`，beta 版本会被打成 `latest`，别人默认安装就会装到测试版。

### 10.2 安装 beta

```bash
cd ../playground
pnpm add @your-name/my-utils@beta
pnpm list @your-name/my-utils
```

**预期结果**：显示 `0.1.2-beta.0`。

### 10.3 查看和管理 tag

```bash
pnpm dist-tag ls @your-name/my-utils
```

**预期结果**：类似：

```text
latest: 0.1.1
beta: 0.1.2-beta.0
```

把 beta 提升为正式版（确认测试通过后再做）：

```bash
pnpm dist-tag add @your-name/my-utils@0.1.2-beta.0 latest
pnpm dist-tag rm @your-name/my-utils beta
```

或者更规范的做法：把 beta 版本 `version` 改成正式版再发一次。已发布的版本内容不能改，但可以发一个新版本号。

### 10.4 验收标准

- [ ] 能发出 `0.1.2-beta.0` 并只打 `beta` tag
- [ ] 能用 `@beta` 安装
- [ ] 能列出、添加、删除 dist-tag
- [ ] 能解释 `latest` 只是一个指针，不是版本号

---

## 11. 实验八：pnpm workspace 多包管理

场景：一个仓库里有多个互相依赖的包，比如 `pkg-a`、`pkg-b`。

### 11.1 创建 workspace

```bash
cd packages
mkdir mono
cd mono
```

新建 `pnpm-workspace.yaml`：

```yaml
packages:
  - pkg-a
  - pkg-b
```

新建根 `package.json`：

```json
{
  "name": "mono",
  "private": true
}
```

### 11.2 创建 pkg-a

新建 `pkg-a/package.json`：

```json
{
  "name": "@your-name/pkg-a",
  "version": "0.1.0",
  "type": "module",
  "main": "./index.js",
  "exports": "./index.js"
}
```

新建 `pkg-a/index.js`：

```js
export function hello(name) {
  return `hello, ${name}`;
}
```

### 11.3 创建 pkg-b

新建 `pkg-b/package.json`：

```json
{
  "name": "@your-name/pkg-b",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@your-name/pkg-a": "workspace:*"
  }
}
```

新建 `pkg-b/index.js`：

```js
import { hello } from '@your-name/pkg-a';

console.log(hello('workspace'));
```

在 `mono/` 根目录安装：

```bash
pnpm install
```

**预期结果**：`pkg-b/node_modules/@your-name/pkg-a` 指向 workspace 里的 `pkg-a`，修改 `pkg-a` 源码立即生效。

运行：

```bash
pnpm --filter @your-name/pkg-b start
```

**预期结果**：输出 `hello, workspace`。

### 11.4 workspace 协议

| 写法 | 发布时会被替换成 | 适用 |
|------|-----------------|------|
| `workspace:*` | 精确版本，例如 `0.1.0` | 内部包，最常用 |
| `workspace:^` | `^0.1.0` | 希望安装方自动升级 |
| `workspace:~` | `~0.1.0` | 只允许补丁升级 |

### 11.5 批量发布

```bash
cd mono
pnpm -r publish --access public --no-git-checks
```

说明：

- `-r` 表示递归所有 workspace 包。
- pnpm 会按依赖顺序发布（先 `pkg-a`，再 `pkg-b`）。
- 已经存在且版本没变的包会跳过，不会重复发布。
- `pkg-b` 的 `private: true` 会阻止它被发布；去掉后才能发。

**重要**：workspace 里发布一定要用 `pnpm publish`，不要用 `npm publish`。
`pnpm` 会在打包时把 `workspace:*` 替换成真实版本号；`npm publish` 不认这个协议，发出去的包会让安装方直接报错。

### 11.6 验收标准

- [ ] `pnpm install` 后 workspace 包被正确链接
- [ ] 修改 `pkg-a` 源码，`pkg-b` 立即看到变化
- [ ] 能解释 `workspace:*` 和普通版本范围的区别
- [ ] 能用 `pnpm -r publish` 按依赖顺序发布
- [ ] 知道为什么不能用 `npm publish` 发 workspace 包

---

## 12. 实验九：自动化发布（可选）

### 12.1 用 Changesets 管理版本

适合多包项目：

```bash
pnpm add -D @changesets/cli
pnpm exec changeset init
pnpm exec changeset
pnpm exec changeset version
pnpm exec changeset publish
```

流程：

1. `pnpm exec changeset`：选择哪些包有改动、改动级别（patch/minor/major），生成变更说明文件。
2. 提交这些变更文件。
3. `pnpm exec changeset version`：自动提升版本号、更新依赖范围、生成 CHANGELOG。
4. `pnpm exec changeset publish`：发布所有新版本。

### 12.2 GitHub Actions 示例

在仓库根目录新建 `.github/workflows/release.yml`：

```yaml
name: release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          registry-url: https://registry.npmjs.org
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm -r publish --access public --no-git-checks --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

要点：

- `NPM_TOKEN` 放在仓库 Secrets 里，**永远不要提交到代码库**。
- `--provenance` 需要公开仓库 + `id-token: write` 权限，用于生成来源证明。
- 公司仓库把 `registry-url` 和 token 换成公司地址即可。
- 示例假设 workspace 根目录就是仓库根目录。如果你的包在 `packages/mono` 下，需要在该目录执行安装/发布，或给步骤加 `working-directory`。

### 12.3 验收标准

- [ ] 能用 changeset 生成版本变更
- [ ] 能看懂 CI 里的发布步骤
- [ ] token 只存在于 Secrets / 环境变量

---

## 13. 包的治理：deprecate 与 unpublish

### 13.1 废弃（推荐）

已发布的版本不能覆盖，但可以标记为废弃，安装时会看到警告：

```bash
# 废弃某个版本
pnpm deprecate @your-name/my-utils@0.1.0 "存在 bug，请升级到 0.1.1"

# 废弃整个包
pnpm deprecate @your-name/my-utils "该包已停止维护，请使用 xxx"
```

### 13.2 撤销发布（谨慎）

```bash
# 撤销某个版本
pnpm unpublish @your-name/my-utils@0.1.0 --force

# 撤销整个包
pnpm unpublish @your-name/my-utils --force
```

注意：

- 如果包发在本地 Verdaccio，命令要加 `--registry http://localhost:4873`，并且 Verdaccio 要处于运行状态；否则命令会指向当前 `.npmrc` 里的默认仓库。
- 公网 npm 对撤销有严格限制（通常只允许发布后短时间内、且没有下游依赖时撤销）。
- 撤销会破坏已经安装过的人的可复现性。
- **优先用 `deprecate` + 发新版本**，不要动不动就 unpublish。
- 本地 Verdaccio 实验时可以随便撤销，重启/清空存储即可。

### 13.3 安全习惯

- 不在代码、README、`.npmrc` 里写 token。
- 需要提交 `.npmrc` 时，用 `${NPM_TOKEN}` 占位；含 token 的 `.npmrc` 加进 `.gitignore`。
- 发布前跑 `npm pack --dry-run`，确认没有把 `.env`、密钥、测试数据打进去。
- 开启 2FA，CI 使用细粒度 token。

建议在仓库根目录的 `.gitignore` 里至少加上：

```gitignore
node_modules/
*.tgz
# 如果 .npmrc 里有明文 token，就不要提交
.npmrc
```

### 13.4 验收标准

- [ ] 能给包或版本加废弃提示
- [ ] 知道公网 unpublish 的风险和限制
- [ ] 能检查 tgz 内容，确认没有敏感文件

---

## 14. 常见报错速查

| 报错 | 常见原因 | 解决 |
|------|---------|------|
| `E404` / `404 Not Found`（publish 时） | registry 地址不对；没登录；scope 不属于你 | 检查 `npm config get registry`、`npm whoami`、包名 scope |
| `E403 Forbidden` | 没有该 scope/组织的发布权限；token 权限不够；账号不对；registry 是只读镜像（如淘宝镜像） | 换有权限的账号/token；确认 scope；发布时切到官方或公司仓库 |
| `E402 Payment Required` | 发布私有 scope 包但账号没有付费方案 | 加 `--access public`，或改用私有 registry |
| `E409 Conflict` | 这个版本号已经存在 | `pnpm version patch` 后重新发布，已发布版本不能覆盖 |
| `EPUBLISHCONFLICT` | 同上（npm 的另一种报错） | 提升版本号 |
| `ENEEDAUTH` | 没登录 / token 没生效 | `npm login` 或检查 `.npmrc` 的 `${NPM_TOKEN}` |
| `EOTP` | 账号开了 2FA | 命令加 `--otp 123456`，或使用 CI token |
| `ERR_PNPM_NO_MATCHING_VERSION` | registry 里没有这个版本/tag | `npm view <pkg> versions`；检查是否装错 registry |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` | `exports` 没有声明这个子路径 | 在 `exports` 里加 `"./xxx"` |
| `ERR_MODULE_NOT_FOUND` | 文件没被发布；入口路径写错；没装依赖 | `npm pack --dry-run` 检查文件；重新 `pnpm install` |
| `ERR_REQUIRE_ESM` | CommonJS 里 `require` 了纯 ESM 包 | 改用 `import`，或升级 Node（20.19+ 支持 require ESM） |
| 本地改代码不生效 | 用的是 tgz 安装 / 已打包的副本 | 改用 `file:`/`link:`，或重新 pack + 安装 |
| 发布后安装方报 `workspace:*` 无效 | 用 `npm publish` 发了 workspace 包 | 用 `pnpm publish` 重新发一个新版本 |
| 装包时提示 peer dependency | 缺少 peer 依赖或版本不匹配 | 安装对应 peer 依赖，或检查版本范围 |
| 包页面没有 README | 包内没有 `README.md` | 在包目录补 README 后发新版本 |

---

## 15. 命令速查

### 15.1 写包 / 检查

```bash
pnpm init
pnpm pack
pnpm pack --dry-run
npm pack --dry-run
tar -tf xxx.tgz
```

### 15.2 本地调试

```bash
pnpm add file:../my-utils
pnpm link ../my-utils
pnpm remove @your-name/my-utils   # 彻底移除 link/file 依赖
pnpm unlink @your-name/my-utils   # 仅解除链接
pnpm add ../my-utils/xxx.tgz
```

### 15.3 发布

```bash
npm login
npm whoami
pnpm publish --access public --no-git-checks
pnpm publish --tag beta --no-git-checks
pnpm -r publish --access public --no-git-checks
pnpm publish --dry-run
```

### 15.4 安装 / 升级

```bash
pnpm add @your-name/my-utils
pnpm add @your-name/my-utils@0.1.0
pnpm add @your-name/my-utils@beta
pnpm remove @your-name/my-utils
pnpm list @your-name/my-utils
pnpm outdated
pnpm update
pnpm update --latest
pnpm why @your-name/my-utils
```

### 15.5 版本 / 标签

```bash
pnpm version patch --no-git-tag-version
pnpm version minor --no-git-tag-version
pnpm version major --no-git-tag-version
pnpm version prerelease --preid beta --no-git-tag-version
pnpm dist-tag ls @your-name/my-utils
pnpm dist-tag add @your-name/my-utils@0.1.2-beta.0 latest
pnpm dist-tag rm @your-name/my-utils beta
```

### 15.6 仓库 / 权限

```bash
npm ping --registry http://localhost:4873
npm adduser --registry http://localhost:4873 --auth-type=legacy
npm whoami --registry http://localhost:4873
npm view @your-name/my-utils --registry http://localhost:4873
npm config get registry
npm config get @company:registry
```

### 15.7 治理

```bash
pnpm deprecate @your-name/my-utils@0.1.0 "原因"
pnpm unpublish @your-name/my-utils@0.1.0 --force
pnpm unpublish @your-name/my-utils --force
```

---

## 16. 最终验收清单与清理

### 16.1 验收清单

完成下面这些，说明你已经真正走通了完整流程：

- [ ] 能独立写出一个带 `exports` / `types` / `files` 的包
- [ ] `npm pack --dry-run` 的文件列表符合预期
- [ ] 能用 `file:`、`pnpm link`、`.tgz` 三种方式本地调试
- [ ] 能在本地 Verdaccio 完成发布
- [ ] 能从本地 registry 安装并运行
- [ ] 能完成一次版本升级 + 重新发布 + 消费端升级
- [ ] 能发 beta 并用 `@beta` 安装
- [ ] 能解释 semver、dist-tag、lockfile 的作用
- [ ] （可选）能发布到公网或公司仓库
- [ ] （可选）能用 workspace + `pnpm -r publish` 管理多包
- [ ] 遇到 `E403` / `E409` / `ERR_PACKAGE_PATH_NOT_EXPORTED` 能自己排查

### 16.2 清理实验产物

以下命令在 `packages/` 目录下执行：

```powershell
# 1. 撤销本地仓库里的试验包（可选；需要 Verdaccio 仍在运行）
cd my-utils
pnpm unpublish @your-name/my-utils --force --registry http://localhost:4873
cd ..

# 2. 停掉 Verdaccio：在它的终端按 Ctrl+C

# 3. 删除本地 registry 配置（否则后续安装会去 localhost）
Remove-Item my-utils/.npmrc, playground/.npmrc -ErrorAction SilentlyContinue

# 4. 删除打包产物
Remove-Item my-utils/*.tgz -ErrorAction SilentlyContinue

# 5. 删除测试用的依赖和锁文件（可选）
Remove-Item playground/node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item playground/pnpm-lock.yaml -ErrorAction SilentlyContinue
```

> 不要把用户级 `~/.npmrc` 整个删掉——里面可能有你公司仓库的认证信息。
> 只删除本次实验创建的项目级 `.npmrc`。

---

## 附：一页纸流程总结

```text
写代码
  └─ package.json（name/version/exports/files）
      └─ npm pack --dry-run  ← 检查发布内容
          └─ 本地用 file:/link: 调试
              └─ 本地 Verdaccio 发布  ← 第一次发布推荐
                  └─ pnpm add 安装验证
                      └─ 改代码 + pnpm version patch
                          └─ 重新 publish + pnpm update
                              └─ 需要测试版就 --tag beta
                                  └─ 多包项目用 workspace + pnpm -r publish
                                      └─ 正式/公司仓库按 scope 配 registry + token
```
