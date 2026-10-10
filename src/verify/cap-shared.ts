/**
 * Cap 前后端共享的常量与类型。
 *
 * 这个文件刻意不引入 `capjs-core`：浏览器侧只需要知道端点路径，
 * 一旦从 cap-api.ts 里导出，就会把服务端库（node:crypto / esbuild）打进前端包。
 */

/**
 * Cap 的 API 基址。widget 会请求 `${CAP_API_BASE}challenge` 与 `${CAP_API_BASE}redeem`
 * —— 这两个路径名是从 cap-widget 源码里读出来的（`${apiEndpoint}challenge`），不是推断。
 */
export const CAP_API_BASE = '/verify/cap/'

/** 最小 KV 接口：Cloudflare KV 与本机实现都满足。 */
export interface NonceStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export interface CapEnv {
  /** 至少 16 字节的高熵随机串。本地放 .dev.vars，线上用 wrangler secret。 */
  CAP_SECRET?: string
  /** 可选：防重放用的 KV 绑定。缺省时自动跳过重放保护。 */
  NONCES?: NonceStore
}

export const isCapApiPath = (pathname: string): boolean => pathname.startsWith(CAP_API_BASE)