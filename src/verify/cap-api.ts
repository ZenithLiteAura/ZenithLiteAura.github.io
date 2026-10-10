import { generateChallenge, validateChallenge } from 'capjs-core'
import type { ValidateChallengeBody } from 'capjs-core'
import { CAP_API_BASE } from './cap-shared.ts'
import type { CapEnv, NonceStore } from './cap-shared.ts'

/**
 * Cap 的后端实现。**只在服务端使用**（Vite dev 中间件 / Cloudflare Worker）：
 * 它依赖 capjs-core，而后者用了 node:crypto 与 node:zlib，
 * 绝不能被浏览器侧的模块导入。
 */

const MIN_SECRET_BYTES = 16

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

/**
 * 基于 KV 的重放保护：同一个 JWT 签名只能兑换一次。
 * KV 是最终一致的，所以这不是严格锁，但与官方文档给 Workers 的示例一致。
 */
function nonceConsumer(store: NonceStore) {
  return async (signatureHex: string, ttlMs: number): Promise<boolean> => {
    const key = `cap:${signatureHex}`
    if (await store.get(key)) return false
    // KV 的 expirationTtl 下限是 60 秒
    const expirationTtl = Math.max(60, Math.ceil(ttlMs / 1000))
    await store.put(key, '1', { expirationTtl })
    return true
  }
}

/**
 * 运行时无关的 Cap 后端：本机（Vite dev 中间件）与 Cloudflare Worker 共用这一份实现。
 *
 * 注意：capjs-core 内部使用 node:crypto 与 node:zlib（instrumentation 的 deflate），
 * 因此在 Cloudflare Workers 上必须开启 nodejs_compat 兼容标志。
 */
export async function handleCapApi(request: Request, env: CapEnv): Promise<Response> {
  const pathname = new URL(request.url).pathname
  const action = pathname.slice(CAP_API_BASE.length).replace(/\/+$/, '')

  if (action !== 'challenge' && action !== 'redeem') {
    return json({ error: 'not_found' }, 404)
  }
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const secret = env.CAP_SECRET
  if (!secret || secret.length < MIN_SECRET_BYTES) {
    return json(
      {
        error: 'server_not_configured',
        message: `CAP_SECRET 缺失或短于 ${MIN_SECRET_BYTES} 字节`,
      },
      503,
    )
  }

  try {
    if (action === 'challenge') {
      // instrumentation 用默认等级（3）——4~7 级才会用到 esbuild。
      return json(await generateChallenge(secret, { instrumentation: true }))
    }

    const body = (await request.json()) as ValidateChallengeBody
    const result = await validateChallenge(secret, body, {
      consumeNonce: env.NONCES ? nonceConsumer(env.NONCES) : undefined,
    })
    return json(result)
  } catch (error) {
    return json(
      { error: 'internal_error', message: error instanceof Error ? error.message : String(error) },
      500,
    )
  }
}