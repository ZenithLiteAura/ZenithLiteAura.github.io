# Hero 点阵文字 + 自定义光标

移植自 `01_projects/web_demos/mimo-hero-clone`（原站 mimo.mi.com 的 `eZ()` 与 `tf()`），
算法常数未改；只做三件事：改成 ESM + 可配置、颜色改读站点变量、补可见性/尺寸/无障碍处理。

## 文件

| 文件 | 作用 |
| --- | --- |
| `particle-text.js` | 点阵引擎：栅格化文字 → alpha 采样 → 抽稀 → 逐帧绘制 + 指针排斥 |
| `cursor.js` | 自定义光标：32px 圆环 + 6px 圆点，悬停文字/按钮放大到 80px |
| `hero.css` | canvas 容器、光标、`cursor:none` 作用域、窄屏两行的高度 |
| `index.js` | 挂载入口：找 `.hero-dots`、给配置、初始化光标 |

## 集成位置

`index.html` 的 hero 内：

```html
<section class="hero wrap" data-cursor-zone>
  ...
  <div class="hero-dots" id="heroDots">
    <h1 class="sr-only">ZenithLiteAura</h1>
    <canvas id="heroDotsCanvas" aria-hidden="true"></canvas>
  </div>
  <p class="tw-line">…名句打字机…</p>
</section>
```

页面底部：光标 DOM + `<script type="module" src="/src/hero/index.js">`。

## 配置

```js
createParticleText(host, {
  text: 'ZenithLiteAura',   // 固定文案（大小写原样）
  colors: null,             // null = 读 --dot-a / --dot-c，并在两者间插值
  fontFamily: null,         // null = --font-display，再回退 Georgia 系衬线
  fontWeight: 400,
  dotSize: 1.8,
  minDots: 900,
  maxDots: 5200,
  repelRadius: 120,
  repelForce: 40,
  damping: 0.55,
  enterDuration: 1600,
  twoLineBelow: 72,         // 单行小于这个字号就分两行
  minContrast: 3,
})
```

## 配色（取色来源）

| token | 来源 | 浅色 | 深色 |
| --- | --- | --- | --- |
| `--dot-a` | `var(--ink)` | `#221E18` | `#EDE5D6` |
| 中间色 | JS 混合 a/c 55% | `#793614` | `#EAA77A` |
| `--dot-c` | `var(--accent)` | `#C14A11` | `#E8752F` |

对比度（代码里用 `ensureContrast` 校验，低于 3:1 会朝黑/白推 10%）：

- 浅色：14.71 / 7.93 / 4.38
- 深色：14.76 / 9.06 / 6.17

主题切换由 `MutationObserver` 监听 `html[data-theme]`，重新取色并 recolor，点位置不动。

## 行为

- 入场：从环形散布弹回，1600ms、错峰 420ms×seed、`1-(1-t)³`、alpha 0.35→1
- 静止：0.15px 级正弦微动
- 排斥：指针 0.18 lerp 平滑，120px 内按 `(1-d/120)*40` 推开，点自身 0.55 lerp
- 仅在视口内且页面可见时跑 rAF；`ResizeObserver` 防抖 120ms 重排
- `prefers-reduced-motion` → 静态点阵，无入场/微动，光标隐藏
- `(hover:none) and (pointer:coarse)` → 不建光标；窄屏自动两行
- canvas `aria-hidden`，另有视觉隐藏的 `<h1>ZenithLiteAura</h1>`

## 自测结果（headless Chrome，preview）

| 项 | 结果 |
| --- | --- |
| 文字完整 | 1440 宽：左/右留白 52/54px，上/下 82/84px，无裁切 |
| 悬停驱散 | 指针 20px 内点数 214 → **0**，50–60px 环带 258 → **424** |
| 移出回位 | 500ms 内恢复 |
| 尺寸变化 | 390/768/1440 三档重排正常，窄屏自动两行（83px × 2 行） |
| 可点击 | 导航链接命中 `A`；hero 中心命中 `SECTION`（canvas 不吃事件） |
| 移动端 | 无自定义光标（`display:none`）、无横向溢出 |
| reduced motion | 帧循环 0 次，光标隐藏 |
| 控制台 | 0 异常；无外部字体/CDN 请求 |