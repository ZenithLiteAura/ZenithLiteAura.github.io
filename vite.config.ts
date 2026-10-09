import { defineConfig } from 'vite'

// 部署目标是 <user>.github.io 根域仓库，因此 base 为 '/'。
// 构建产物输出到 dist/，由 GitHub Actions 上传为 Pages artifact。
export default defineConfig({
  base: '/',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    sourcemap: false,
  },
})