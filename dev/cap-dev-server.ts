import { existsSync, readFileSync } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import { handleCapApi } from '../src/verify/cap-api.ts'
import { isCapApiPath } from '../src/verify/cap-shared.ts'
import type { CapEnv } from '../src/verify/cap-shared.ts'

/**
 * 仅开发期使用的 Cap 后端：把 `/verify/cap/*` 交给与 Cloudflare Worker 完全相同的那一个
 * handler，于是 `npm run dev` 下不需要任何云资源就能完整跑通 Cap。
 *
 * 生产环境由 worker/index.ts 提供同样的接口。
 */

/** 开发期兜底密钥：只在本机 dev server 生效，永远不会被部署。 */
const DEV_FALLBACK_SECRET = 'dev-only-secret-do-not-use-in-production'

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

function resolveSecret(): { secret: string; source: string } {
  const fromEnv = process.env.CAP_SECRET
  if (fromEnv) return { secret: fromEnv, source: 'process.env.CAP_SECRET' }
  const fromFile = readDevVars().CAP_SECRET
  if (fromFile) return { secret: fromFile, source: '.dev.vars' }
  return { secret: DEV_FALLBACK_SECRET, source: 'dev fallback' }
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export function capDevServer(): Plugin {
  return {
    name: 'cap-dev-server',
    apply: 'serve',
    configureServer(server) {
      const { secret, source } = resolveSecret()
      server.config.logger.info(
        `  \u001b[36mcap\u001b[0m dev backend mounted at /verify/cap/ (secret from ${source})`,
      )

      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0]
        if (!isCapApiPath(pathname)) {
          next()
          return
        }

        void (async () => {
          try {
            const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req)
            const request = new Request(new URL(req.url ?? '/', 'http://localhost'), {
              method: req.method,
              headers: { 'content-type': String(req.headers['content-type'] ?? 'application/json') },
              // Buffer 不满足 DOM 的 BodyInit，转成 Uint8Array
              body: body ? new Uint8Array(body) : undefined,
            })
            const env: CapEnv = { CAP_SECRET: secret }
            const response = await handleCapApi(request, env)
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