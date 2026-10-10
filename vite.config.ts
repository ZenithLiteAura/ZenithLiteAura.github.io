import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { capDevServer } from './dev/cap-dev-server.ts'

// 部署目标是 <user>.github.io 根域仓库，因此 base 为 '/'。
// 构建产物输出到 dist/，由 GitHub Actions 上传为 Pages artifact，
// 或由 Cloudflare Worker 作为静态资源发布（见 wrangler.jsonc）。
const entry = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  base: '/',
  // 仅开发期生效：把 /verify/cap/* 接到与 Cloudflare Worker 相同的那份 handler，
  // 于是 npm run dev 下不需要任何云资源就能跑通 Cap。
  plugins: [capDevServer()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    // 多页（index.html + verify/index.html）必须开启 CSS 代码分割，
    // 否则两个验证码的样式会被合并进一个全站 CSS，主页面也要白白下载。
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: entry('./index.html'),
        verify: entry('./verify/index.html'),
      },
    },
  },
})