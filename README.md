# ZenithLiteAura.github.io

MIUIX / HyperOS 风格的个人主页 · 中英双语 · Vite + TypeScript

**线上地址：<https://zenithliteaura.github.io/>**

---

## 这是什么

一个手写的静态个人主页。视觉语言对齐小米 MIUIX（HyperOS）设计体系：
浅灰底 + 纯白卡片 + `#3482ff` 主色、20px 卡片圆角、胶囊控件、玻璃拟态顶栏、
弹簧曲线动效，以及滚动时「大标题收起 + 顶栏玻璃化」的经典行为。

- 中英双语，右上角一键切换（默认跟随浏览器语言，回退中文）
- 浅色 / 深色 / 跟随系统三种主题，选择会记住，刷新无闪烁
- 项目卡片点击弹出 MIUIX OverlayDialog 风格详情层（Esc 关闭、焦点自动归位）
- 零前端框架、零运行时依赖，构建产物约 41 KB（gzip 后约 14 KB）
- 键盘可达、可见焦点环、尊重 `prefers-reduced-motion`，正文对比度 ≥ 4.5:1

## 本地开发

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器（热更新）
npm run build     # tsc 类型检查 + vite 构建，输出到 dist/
npm run preview   # 预览 dist/ 产物
npm run typecheck # 只做类型检查
```

> **Windows 提示**：如果 PowerShell 提示「running scripts is disabled」，
> 说明执行策略拦截了 `npm.ps1`，改用 `npm.cmd`（例如 `npm.cmd run build`）即可。

## 目录结构

```
index.html                  Vite 入口（主页面，含防主题闪烁的内联脚本）
verify/index.html           Vite 入口（/verify/ 验证码对比页）
src/
  main.ts                   主页面挂载与全局重渲染
  app.ts                    整页组装
  store.ts                  语言/主题状态 + localStorage 持久化
  config.ts                 SHOW_TODO_MARKERS 开关
  dom.ts                    极简 DOM 构建工具（不用 innerHTML 拼字符串）
  data/profile.ts           个人资料（要改内容主要改这里）
  data/curated.ts           手写的项目介绍 + 不上首页的仓库名单
  data/projects.ts          仓库快照 → 项目卡片数据
  data/repos.snapshot.json  GitHub 公开仓库快照（本仓库的数据源）
  i18n/{zh,en,types,index}.ts  中英文案字典
  sections/*.ts             顶栏、Hero、关于、项目、联系、页脚、详情弹层
  styles/{tokens,base,components,motion}.css  MIUIX 令牌与样式
  verify/                   /verify/ 页：layout、driftcha、cap、cap-api、cap-shared
dev/cap-dev-server.ts       仅开发期的 Cap 后端（Vite 中间件，复用同一个 handler）
worker/index.ts             Cloudflare Worker 入口（线上提供 /verify/cap/*）
public/                     头像、favicon、robots.txt
.npmrc                      放行本项目自己的 remote 依赖（driftcha 的 tarball），CI 必需
.github/workflows/deploy.yml 构建并发布到 GitHub Pages
```

## 怎么改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 显示名、签名、自我介绍、技能、联系方式 | `src/data/profile.ts` |
| 项目卡片上的文字介绍 | `src/data/curated.ts`（`curatedDescriptions`） |
| 哪些仓库不上首页 | `src/data/curated.ts`（`hiddenRepos`） |
| 仓库列表与 Star 数 | `src/data/repos.snapshot.json` |
| 任意界面文案（中/英） | `src/i18n/zh.ts` 与 `src/i18n/en.ts`（键必须一一对应，否则类型检查会报错） |
| 配色、圆角、动效曲线 | `src/styles/tokens.css` |

### 内容现状

页面上的资料都已写成真实内容，没有待办占位：

- 显示名 `ZenithLiteAura`；签名与自我介绍写在 `profile.headline` / `profile.bio`
- 技能目前只列了 `Python`，想加别的往 `profile.skills` 数组里加字符串即可
- 联系方式有 GitHub 与邮箱两个（邮箱走 `mailto:`，不会新开窗口）
- 项目卡片只展示 `Pho_Community`。`cuddly-guide` 是建仓库时自动生成的空占位
  （只有一个 LICENSE 和 14 字节的 README），已列入 `hiddenRepos` 不上首页；
  哪天它真有内容了，把名字从 `hiddenRepos` 里删掉就会自动出现
- 首页由 `profile.ts` 与 `curated.ts` 提供文案，因此不再依赖 GitHub 上的仓库描述；
  想改首页说法不必去动 GitHub 仓库设置

`src/config.ts` 里的 `SHOW_TODO_MARKERS` 现在是 `false`。以后新增了还没写描述的仓库，
把它改成 `true` 就能把「待补充」提示显示出来，方便提醒自己补文案。

## 刷新 GitHub 数据

`src/data/repos.snapshot.json` 是一次性快照（页面上不放任何 token，所以不在浏览器里调 API）。
需要更新时，用下面这段 PowerShell 重新生成（会**过滤掉 private 仓库**，避免把私有仓库名写到公开页面上）：

```powershell
$token = Read-Host "GitHub PAT (只需 repo 读权限)" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))
$headers = @{ Authorization = "token $plain"; 'User-Agent' = 'refresh'; Accept = 'application/vnd.github+json' }

$repos = (Invoke-WebRequest 'https://api.github.com/user/repos?per_page=100&visibility=public&affiliation=owner' `
  -Headers $headers -UseBasicParsing).Content | ConvertFrom-Json

$trim = $repos | ForEach-Object {
  [ordered]@{
    name = $_.name; description = $_.description; html_url = $_.html_url
    homepage = $_.homepage; language = $_.language
    stargazers_count = $_.stargazers_count; fork = $_.fork; archived = $_.archived
    created_at = $_.created_at; pushed_at = $_.pushed_at
  }
} | Sort-Object @{e={$_.fork}}, @{e={-$_.stargazers_count}}, @{e={$_.pushed_at};Descending=$true}

$json = $trim | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText("$PWD/src/data/repos.snapshot.json", $json, (New-Object Text.UTF8Encoding($false)))
```

## 部署

推送到 `main` 即自动构建发布：

`.github/workflows/deploy.yml` → `npm ci` → `npm run build` → 上传 `dist/` 为 Pages 产物 → `actions/deploy-pages` 发布。

对应的 Pages 构建设置是 **GitHub Actions**（不是分支目录）。如果哪天需要回退成老式分支发布，
可以在仓库 Settings → Pages 里改回分支模式。

### 另：部署到 Cloudflare Workers（可选）

仓库里的 `wrangler.jsonc` 让同一份构建产物也能发到 Cloudflare：

```jsonc
{
  "name": "zenithliteaura-github-io",
  "compatibility_date": "2026-10-09",
  "assets": { "directory": "./dist" }   // 纯静态资源，没有 Worker 入口
}
```

在 Cloudflare 的 Workers & Pages 里连接本仓库后，Build 设置填：

| 项 | 值 |
| --- | --- |
| 构建命令 | `npm run build` |
| 部署命令（生产分支） | `npx wrangler deploy` |
| 预览命令（非生产分支） | `npx wrangler versions upload` |

三个字段都是必填的（构建命令虽然标着"可选"，但留空就无法进入下一步）。

> `npx wrangler preview` 不要填：那是 wrangler 4 里另一套功能（Worker Previews，目前 open beta），
> 不是这里要用的「非生产分支上传版本」命令。

本地想验证配置对不对，不用登录 Cloudflare 就能干跑：

```bash
npm run build
npx wrangler deploy --dry-run          # 生产：会打印读到了 dist/ 里几个文件
npx wrangler versions upload --dry-run # 预览：校验配置能解析
```

> 注意：`wrangler.jsonc` 的 `assets.directory` 指向 `dist/`，所以**必须先 `npm run build`**
> 再 `wrangler deploy`，否则会上传一个空的资源目录。

## `/verify/` 验证码对比页

`/verify/` 是第二个页面（多页构建的第二个入口），在同一个页面上同时挂两个验证码方案，用来比较：

<https://zenithliteaura.github.io/verify/>

| 维度 | Driftcha | Cap |
| --- | --- | --- |
| 原理 | 运动噪点：数字只在运动中显现 | 隐形工作量证明 + 浏览器插桩 |
| 无服务端可用 | ✅ 官方浏览器模式 | ❌ 必须有后端 |
| 本站落地 | GitHub Pages 直接可用 | Cloudflare Worker（`capjs-core`）或自建 Standalone |
| Workers 兼容 | ❌（服务端是 Node 中间件） | ✅ 官方提供 Workers 示例 |
| 无障碍 | ❌ 依赖运动视觉 | ✅ 无视觉谜题 |
| 中国可达性 | ✅ 无外部 CDN 依赖 | ⚠️ WASM 默认走 jsdelivr，可自托管 |
| 成熟度 | 0 star（2026-10 新建） | 约 7,900 star，有生产使用者 |
| 安装 | 未发布 npm，按 commit 固定 tarball | 普通 npm 包 |

### 两个方案的运行方式

- **Driftcha** 用 `createLocalBackend`（浏览器模式），全部计算在页面内完成，
  **不产生 pass token、不构成真实防护**——上游自述是「速度障碍，而不是防御」。
  它依赖运动视觉，屏幕阅读器/低视力用户无法完成，页面上因此固定给出邮件替代入口；
  并且在 `prefers-reduced-motion: reduce` 时**不自动加载**，改为点按钮后加载。
- **Cap** 需要后端。页面会先 POST 一次 `/verify/cap/challenge` 探测：
  - 探测成功 → 挂上 `<cap-widget>`，解题后由服务端签发 token；
  - 探测失败（GitHub Pages 是纯静态托管）→ 显示「Cap 需要一个后端」提示，
    而不是渲染一个永远报错的控件。静态托管下这次探测会产生一条 404 网络日志，属预期。

### Cap 后端在哪

同一份 handler（`src/verify/cap-api.ts`）挂了两个宿主：

| 环境 | 宿主 | 说明 |
| --- | --- | --- |
| 本地 `npm run dev` | Vite dev-server 中间件（`dev/cap-dev-server.ts`） | 零云资源即可端到端跑通；密钥取 `.dev.vars`，没有则用仅限本机的兜底值 |
| 线上 | Cloudflare Worker（`worker/index.ts`） | 只处理 `/verify/cap/*`，其余交给静态资源；需要 `nodejs_compat` |

线上配置步骤：

```bash
npx wrangler secret put CAP_SECRET        # 至少 16 字节的高熵随机串
npx wrangler secret put ADMIN_PASSWORD    # 后台登录密码（见「/admin 后台」一节）
npx wrangler kv namespace create ADMIN_KV # 绑定名必须是 ADMIN_KV，把返回的 id 填进 wrangler.jsonc
```

本地想用固定密钥，就把 `.dev.vars.example` 复制成 `.dev.vars`（已被 gitignore）。

### 关于依赖的两个坑

1. **driftcha 未发布到 npm**，只能从 GitHub 取。这里用的是**按 commit 固定的 tarball URL**
   而不是 `github:` 简写：`github:` 会被 npm 写成 `git+ssh://`，GitHub Actions 没有 SSH 私钥，
   `npm ci` 必然失败；tarball 走 HTTPS，既不需要 git 也不需要 SSH。
2. **npm 12 起默认拒绝一切非 registry 来源**（`allow-remote=none` / `allow-git=none`），
   所以仓库根有 `.npmrc` 写着 `allow-remote=root`：只放行本项目自己声明的 remote 依赖，
   传递依赖引入的 remote 包仍被拒绝。**删掉这个文件 CI 会装不上依赖。**

## `/admin` 后台登录页

<https://zenithliteaura.site/admin/>

只在 Cloudflare Worker 上可用；从 GitHub Pages 打开会提示「需要后端」。

登录流程：填密码 → 点「登录」→ Cap **浮动模式**从按钮上方弹入并自动解题 →
解完把 token 写到按钮上并**自动重新触发提交** → 服务端校验「一次性凭证 + 密码 + 限流」→
下发 `HttpOnly` 会话 cookie。

用浮动模式的原因：控件平时不占位，点按钮才弹出，解完自动继续提交——正是 Cap 官方 demo 的交互。
点击动画（对勾用 `stroke-dashoffset` 0.3s 画出、失败时 `cap-shake` 抖动 0.5s）由 cap-widget 自带，
不需要自己实现。

### 安全构成

| 层 | 实现 |
| --- | --- |
| 验证码 | Cap，独立 `scope: 'admin'`，与公开 `/verify/` 完全隔离 |
| 凭证 | 解出后存 KV，登录时**一次性消耗**（用 `sha256(整串 token)` 作键，不依赖 capjs-core 的 token 格式） |
| 密码 | Worker secret；两边各过一遍 HMAC 再比等长摘要（不泄露长度、无提前返回） |
| 限流 | 同一 IP 15 分钟最多 10 次；连续失败 5 次锁定 → `429` + `Retry-After` |
| 会话 | HMAC-SHA256，密钥由 `CAP_SECRET` 域分离派生（可用 `ADMIN_SESSION_SECRET` 覆盖） |
| Cookie | `HttpOnly + SameSite=Strict + Path=/admin`，7 天 |

> 如实说明：Cap 只是其中一层（上游自称 speed bump，真正的门是密码 + 一次性短时效凭证 + 限流）；
> KV 是最终一致的，所以「一次性消耗」与「限流」是尽力而为而非原子操作。
> 要更强可以上 Durable Objects，或在 `/admin` 前面再套一层 Cloudflare Access。

### 本地调试

`npm run dev` 会用 Vite 中间件挂上**同一份 handler**，并用**内存 KV** 顶替：

```bash
npm run dev     # 打开 http://localhost:5173/admin/
```

密钥取 `.dev.vars` 里的 `CAP_SECRET` / `ADMIN_PASSWORD`，缺省时用仅本机的兜底值。

## 说明

仓库未附加开源许可证，代码与文案版权归 ZenithLiteAura 所有。