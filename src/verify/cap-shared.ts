/**
 * Cap 前后端共享的路径常量。
 *
 * 这个文件刻意不引入任何服务端依赖：浏览器侧只需要知道端点路径，
 * 一旦把 cap-api.ts 里的东西导出过来，就会把 capjs-core（node:crypto / esbuild）打进前端包。
 */

/**
 * 公开页面的 Cap API 基址。widget 会请求 `${CAP_API_BASE}challenge` 与 `${CAP_API_BASE}redeem`
 * —— 这两个路径名是从 cap-widget 源码里读出来的（`${apiEndpoint}challenge`），不是推断。
 */
export const CAP_API_BASE = '/verify/cap/'

export const isCapApiPath = (pathname: string): boolean => pathname.startsWith(CAP_API_BASE)