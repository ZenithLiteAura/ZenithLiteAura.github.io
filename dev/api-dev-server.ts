import { existsSync, readFileSync } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import { handleAdminApi } from '../src/admin/admin-api.ts'
import { isAdminApiPath } from '../src/admin/admin-shared.ts'
import { handleCapApi } from '../src/verify/cap-api.ts'
import { isCapApiPath } from '../src/verify/cap-shared.ts'
import type { KvStore, ServerEnv } from '../src/server-shared.ts'

/**
 * 仅开发期使用的后端：把 `/verify/cap/*` 与 `/admin/api/*` 交给与 Cloudflare Worker
 * 完全相同的那两个 handler，并用内存 Map 顶替 KV。
 *
 * 于是 `npm run dev` 下不需要任何云资源就能完整跑通：Cap 验证码、后台登录、
 * 凭证一次性消耗、限流与锁定。
 */

/** 开发期兜底值：只在本机 dev server 生效，永远不会被部署。 */
const DEV_FALLBACK_SECRET = 'dev-only-secret-do-not-use-in-production'
const DEV_FALLBACK_PASSWORD = 'dev-only-password-do-not-use-in-production'

/** 内存版 KV：TTL 语义与 Cloudflare KV 一致（够本地测试用）。 */
class MemoryKv implements KvStore {
  private readonly entries = new Map<string, { value: string; expiresAt: number }>()

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key)
      return null
    }
    return entry.value
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    const ttlMs = (options?.expirationTtl ?? 3600) * 1000
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key)
  }
}

function readDevVars(): Record<string, string> {
  const file = new URL('../.dev.vars', import.meta.url)
  if (!existsSync(file)) return {}
  const out: Record<string, string> = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    out[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return out
}

function resolveEnv(): { env: ServerEnv; notes: string[] } {
  const vars = readDevVars()
  const notes: string[] = []

  const secret = process.env.CAP_SECRET ?? vars.CAP_SECRET
  const password = process.env.ADMIN_PASSWORD ?? vars.ADMIN_PASSWORD

  if (!secret) notes.push('CAP_SECRET（用兜底值）')
  if (!password) notes.push('ADMIN_PASSWORD（用兜底值）')

  return {
    env: {
      CAP_SECRET: secret ?? DEV_FALLBACK_SECRET,
      ADMIN_PASSWORD: password ?? DEV_FALLBACK_PASSWORD,
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? vars.ADMIN_SESSION_SECRET,
      ADMIN_KV: new MemoryKv(),
    },
    notes,
  }
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      const { env, notes } = resolveEnv()
      server.config.logger.info(
        `  \u001b[36mapi\u001b[0m dev backend: /verify/cap/ + /admin/api/` +
          (notes.length ? `  (${notes.join('、')})` : '  (来自 .dev.vars)'),
      )

      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0]
        const isCap = isCapApiPath(pathname)
        const isAdmin = isAdminApiPath(pathname)
        if (!isCap && !isAdmin) {
          next()
          return
        }

        void (async () => {
          try {
            const body =
              req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req)
            // 必须带上真实端口：handler 里会拿 request.url 的 origin 跟 Origin 头比对，
            // 写成 http://localhost 会让同源检查失败（dev server 跑在 :5173）。
            const host = req.headers.host ?? 'localhost'
            const request = new Request(new URL(req.url ?? '/', `http://${host}`), {
              method: req.method,
              headers: {
                'content-type': String(req.headers['content-type'] ?? 'application/json'),
                // 让 handler 里基于 Origin 的跨站检查在本地也能生效
                ...(req.headers.origin ? { origin: String(req.headers.origin) } : {}),
                ...(req.headers.cookie ? { cookie: String(req.headers.cookie) } : {}),
              },
              // Buffer 不满足 DOM 的 BodyInit，转成 Uint8Array
              body: body ? new Uint8Array(body) : undefined,
            })

            const response = isAdmin
              ? await handleAdminApi(request, env)
              : await handleCapApi(request, env)

            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            res.end(Buffer.from(await response.arrayBuffer()))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json; charset=utf-8')
            res.end(
              JSON.stringify({
                error: 'dev_middleware_error',
                message: error instanceof Error ? error.message : String(error),
              }),
            )
          }
        })()
      })
    },
  }
}