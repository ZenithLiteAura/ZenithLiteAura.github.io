/**
 * 服务端共享类型与工具（Worker 与本地 dev 中间件都用）。
 *
 * 浏览器侧**不要**导入这个文件——它是给后端用的。
 */

/** 最小 KV 接口：Cloudflare KV 与本地内存实现都满足。 */
export interface KvStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

export interface ServerEnv {
  /** Cap 的 HMAC 主密钥，至少 16 字节。 */
  CAP_SECRET?: string
  /** 一个 KV 命名空间：挑战 nonce、一次性登录凭证、登录限流共用。 */
  ADMIN_KV?: KvStore
  /** 后台登录密码。 */
  ADMIN_PASSWORD?: string
  /** 可选：会话签名密钥。缺省时由 CAP_SECRET 派生（域分离）。 */
  ADMIN_SESSION_SECRET?: string
  /** 拉取 GitHub 公开仓库快照用（后台的「刷新快照」按钮）。 */
  GITHUB_TOKEN?: string
}

/**
 * 用 KV 做挑战重放保护。
 * KV 是最终一致的，所以这不是严格原子锁，但与 Cap 官方给 Workers 的示例一致。
 */
export function kvNonceConsumer(store: KvStore) {
  return async (signatureHex: string, ttlMs: number): Promise<boolean> => {
    const key = `cap:nonce:${signatureHex}`
    if (await store.get(key)) return false
    // KV 的 expirationTtl 下限是 60 秒
    await store.put(key, '1', { expirationTtl: Math.max(60, Math.ceil(ttlMs / 1000)) })
    return true
  }
}