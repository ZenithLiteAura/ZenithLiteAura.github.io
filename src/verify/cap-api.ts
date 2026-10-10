import { generateChallenge, validateChallenge } from 'capjs-core'
import type { ValidateChallengeBody } from 'capjs-core'
import { CAP_API_BASE } from './cap-shared.ts'
import { kvNonceConsumer } from '../server-shared.ts'
import type { ServerEnv } from '../server-shared.ts'

/**
 * 公开页面（/verify/）的 Cap 后端。**只在服务端使用**（Vite dev 中间件 / Cloudflare Worker）：
 * 它依赖 capjs-core，而后者用了 node:crypto 与 node:zlib，
 * 绝不能被浏览器侧的模块导入。
 */

const MIN_SECRET_BYTES = 16

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  })
}

export function secretProblem(env: ServerEnv): string | null {
  if (!env.CAP_SECRET || env.CAP_SECRET.length < MIN_SECRET_BYTES) {
    return `CAP_SECRET 缺失或短于 ${MIN_SECRET_BYTES} 字节`
  }
  return null
}

/**
 * 运行时无关的 Cap 后端：本机（Vite dev 中间件）与 Cloudflare Worker 共用这一份实现。
 *
 * 注意：capjs-core 内部使用 node:crypto 与 node:zlib（instrumentation 的 deflate），
 * 因此在 Cloudflare Workers 上必须开启 nodejs_compat 兼容标志。
 */
export async function handleCapApi(request: Request, env: ServerEnv): Promise<Response> {
  const pathname = new URL(request.url).pathname
  const action = pathname.slice(CAP_API_BASE.length).replace(/\/+$/, '')

  if (action !== 'challenge' && action !== 'redeem') {
    return jsonResponse({ error: 'not_found' }, 404)
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  const problem = secretProblem(env)
  if (problem) {
    return jsonResponse({ error: 'server_not_configured', message: problem }, 503)
  }
  const secret = env.CAP_SECRET as string

  try {
    if (action === 'challenge') {
      // instrumentation 用默认等级（3）——4~7 级才会用到 esbuild。
      return jsonResponse(await generateChallenge(secret, { instrumentation: true }))
    }

    const body = (await request.json()) as ValidateChallengeBody
    const result = await validateChallenge(secret, body, {
      // 配了 KV 就开重放保护；没配也能跑，只是弱一些
      consumeNonce: env.ADMIN_KV ? kvNonceConsumer(env.ADMIN_KV) : undefined,
    })
    return jsonResponse(result)
  } catch (error) {
    return jsonResponse(
      { error: 'internal_error', message: error instanceof Error ? error.message : String(error) },
      500,
    )
  }
}