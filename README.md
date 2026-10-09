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
index.html                  Vite 入口（含防主题闪烁的内联脚本）
src/
  main.ts                   挂载与全局重渲染
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
public/                     头像、favicon、robots.txt
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

## 归档说明

改造之前这个仓库放的是一个「计时器」单页应用。原始文件完整保存在
`archive/timer-app` 分支（提交 `24d52226`）中，随时可以取回。

## 说明

仓库未附加开源许可证，代码与文案版权归 ZenithLiteAura 所有。