import type { LocalizedText } from '../types'

export interface ComparisonRow {
  feature: LocalizedText
  driftcha: LocalizedText
  cap: LocalizedText
  /** 这一项哪边更合适，用于在表格里高亮（tie 则都不高亮）。 */
  winner: 'driftcha' | 'cap' | 'tie'
}

/**
 * 对比表内容。全部逐条对应调研时在源码/文档/npm 元数据里核实的事实，
 * 不做主观鼓吹。
 */
export const comparisonRows: ComparisonRow[] = [
  {
    feature: { zh: '原理', en: 'How it works' },
    driftcha: { zh: '运动噪点：数字只在运动中显现', en: 'Motion noise: digits exist only while moving' },
    cap: { zh: '隐形工作量证明 + 浏览器插桩', en: 'Invisible proof-of-work + JS instrumentation' },
    winner: 'tie',
  },
  {
    feature: { zh: '无服务端能否运行', en: 'Runs without a backend' },
    driftcha: { zh: '能，官方浏览器模式', en: 'Yes — the official browser-only mode' },
    cap: { zh: '不能，必须有后端', en: 'No — a backend is required' },
    winner: 'driftcha',
  },
  {
    feature: { zh: '本站的落地方式', en: 'How it runs here' },
    driftcha: { zh: 'GitHub Pages 直接可用', en: 'Works on GitHub Pages as-is' },
    cap: { zh: 'Cloudflare Worker（capjs-core）或自建 Standalone', en: 'Cloudflare Worker (capjs-core) or self-hosted Standalone' },
    winner: 'tie',
  },
  {
    feature: { zh: 'Cloudflare Workers 兼容', en: 'Cloudflare Workers support' },
    driftcha: { zh: '不支持：服务端是 Node 中间件，用了 node:crypto/Buffer', en: 'No: its server is Node middleware (node:crypto, Buffer)' },
    cap: { zh: '支持：capjs-core 无状态，官方给出 Workers 示例', en: 'Yes: capjs-core is stateless, with an official Workers example' },
    winner: 'cap',
  },
  {
    feature: { zh: '无障碍', en: 'Accessibility' },
    driftcha: { zh: '不可用：依赖运动视觉，屏幕阅读器/低视力用户无法完成', en: 'Poor: motion-only, unsolvable for screen-reader and low-vision users' },
    cap: { zh: '无视觉谜题，隐形；官网宣称 WCAG 2.2 AA', en: 'No visual puzzle, invisible; upstream claims WCAG 2.2 AA' },
    winner: 'cap',
  },
  {
    feature: { zh: '中国大陆可达性', en: 'Reachability from mainland China' },
    driftcha: { zh: '无外部 CDN 运行时依赖', en: 'No runtime CDN dependency' },
    cap: { zh: 'WASM 默认来自 jsdelivr（官方承认国内可能被墙），可改指自托管', en: 'WASM defaults to jsdelivr (upstream notes it can be blocked in China); can be self-hosted' },
    winner: 'driftcha',
  },
  {
    feature: { zh: '客户端体积', en: 'Client size' },
    driftcha: { zh: '约 24 KB JS + 12 KB CSS', en: '~24 KB JS + 12 KB CSS' },
    cap: { zh: '约 20 KB gzip（另有运行时 WASM）', en: '~20 KB gzip (plus runtime WASM)' },
    winner: 'cap',
  },
  {
    feature: { zh: '成熟度', en: 'Maturity' },
    driftcha: { zh: '0 star，2026-10-09 才创建，v0.2.0', en: '0 stars, created 2026-10-09, v0.2.0' },
    cap: { zh: '约 7,900 star，有生产使用者（bunny.net、AdGuard）', en: '~7,900 stars, used in production (bunny.net, AdGuard)' },
    winner: 'cap',
  },
  {
    feature: { zh: '安装方式', en: 'Install' },
    driftcha: { zh: '未发布 npm，只能按 commit 固定 tarball（npm 12 默认还需放行 remote）', en: 'Not on npm; pinned tarball only (npm 12 also needs remote deps allowed)' },
    cap: { zh: '普通 npm 包', en: 'Regular npm packages' },
    winner: 'cap',
  },
  {
    feature: { zh: '许可证', en: 'License' },
    driftcha: { zh: 'MIT', en: 'MIT' },
    cap: { zh: 'Apache-2.0', en: 'Apache-2.0' },
    winner: 'tie',
  },
]