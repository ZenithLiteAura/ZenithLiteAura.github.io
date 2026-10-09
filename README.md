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
| 称呼、别名、签名、自我介绍、技能、联系方式 | `src/data/profile.ts` |
| 项目列表 | `src/data/repos.snapshot.json` |
| 任意界面文案（中/英） | `src/i18n/zh.ts` 与 `src/i18n/en.ts`（键必须一一对应，否则类型检查会报错） |
| 配色、圆角、动效曲线 | `src/styles/tokens.css` |

### 待办：需要你补的真实资料

页面上目前带橙色 `TODO` 标记的地方，都是「先用 GitHub 现成资料占位、等你替换」的内容：

1. **别名**：GitHub 用户名是 `ZenithLiteAura`，提交记录署名是 `Nahida` —— 决定主页显示哪个。
2. **一句话签名**（`profile.headline`）与**自我介绍**（`profile.bio`）：现在是占位文案。
3. **技能与工具**（`profile.skills`）：现在是示例值（Dart / Flutter / TypeScript / C#），请换成你真实在用的。
4. **联系方式**（`profile.contacts`）：GitHub 链接已确认；邮箱 / QQ / 哔哩哔哩留空。
   **邮箱默认不公开**，需要公开时再填 `value` 与 `href` 并把 `todo` 改成 `false`。
5. **项目描述**：`cuddly-guide` 在 GitHub 上没有填描述，页面上显示为待补充。
6. **英文文案**：仓库描述目前只有中文，切到英文时原样回落，需要时请补英文。

全部替换完，把 `src/config.ts` 里的 `SHOW_TODO_MARKERS` 改成 `false`，页面上所有 `TODO` 标记会一起消失。

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