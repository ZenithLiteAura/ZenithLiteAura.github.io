import { generateChallenge, validateChallenge } from 'capjs-core'
import type { ValidateChallengeBody } from 'capjs-core'
import { jsonResponse } from '../verify/cap-api.ts'
import { handleAdminContent, handleSnapshotRefresh } from '../content/content-api.ts'
import { kvNonceConsumer } from '../server-shared.ts'
import type { KvStore, ServerEnv } from '../server-shared.ts'
import {
  ADMIN_API_BASE,
  ADMIN_CAP_SCOPE,
  CAP_TOKEN_TTL_MS,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_MAX_FAILURES,
  LOGIN_WINDOW_SECONDS,
  SESSION_COOKIE,
  SESSION_COOKIE_PATH,
  SESSION_TTL_SECONDS,
} from './admin-shared.ts'

/**
 * 管理后台 API。运行时无关：本地由 Vite dev 中间件挂载，线上由 Cloudflare Worker 挂载。
 *
 * 登录的强度构成（Cap 只是其中一层——上游自己把它定性为 speed bump）：
 *   密码（Worker secret，恒定时间比对）
 * + 一次性短时效验证码凭证（KV，2 分钟，用完即删）
 * + 按 IP 的尝试限流与失败锁定
 * + 7 天 HttpOnly / SameSite=Strict / Path=/admin 会话
 */

const encoder = new TextEncoder()

/* ------------------------------- 基础工具 ------------------------------- */

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const normalised = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '='))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** 会话签名密钥：域分离后由 CAP_SECRET 派生，省得你再记一个 secret。 */
async function sessionKey(env: ServerEnv): Promise<Uint8Array> {
  const material = env.ADMIN_SESSION_SECRET || `admin-session|${env.CAP_SECRET ?? ''}`
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(material)))
}

async function hmac(keyBytes: Uint8Array, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

/* ------------------------------- 会话 ------------------------------- */

async function signSession(env: ServerEnv, now = Date.now()): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = now + SESSION_TTL_SECONDS * 1000
  const payload = toBase64Url(encoder.encode(JSON.stringify({ iat: now, exp: expiresAt })))
  const signature = toBase64Url(await hmac(await sessionKey(env), payload))
  return { token: `${payload}.${signature}`, expiresAt }
}

async function verifySession(env: ServerEnv, token: string): Promise<{ iat: number; exp: number } | null> {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = toBase64Url(await hmac(await sessionKey(env), payload))
  if (!constantTimeEqual(expected, signature)) return null
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { iat?: number; exp?: number }
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return { iat: data.iat ?? 0, exp: data.exp }
  } catch {
    return null
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

/** 本机 http://localhost 下不加 Secure，否则 dev 里 cookie 会被丢掉。 */
function sessionCookie(request: Request, value: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${SESSION_COOKIE}=${value}; Path=${SESSION_COOKIE_PATH}; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${secure}`
}

/** 供内容接口复用：只有带有效会话 cookie 才算登录。 */
export async function hasAdminSession(request: Request, env: ServerEnv): Promise<boolean> {
  const token = readCookie(request, SESSION_COOKIE)
  if (!token) return false
  return (await verifySession(env, token)) !== null
}

/* --------------------------- 密码与限流 --------------------------- */

/**
 * 恒定时间比对：两边都过一遍 HMAC，得到等长摘要再比较，
 * 这样既不泄露密码长度，也不会有提前 return。
 */
async function passwordMatches(env: ServerEnv, provided: string): Promise<boolean> {
  const expected = env.ADMIN_PASSWORD ?? ''
  if (!expected) return false
  const key = await sessionKey(env)
  const providedMac = toBase64Url(await hmac(key, `password|${provided}`))
  const expectedMac = toBase64Url(await hmac(key, `password|${expected}`))
  return constantTimeEqual(providedMac, expectedMac)
}

function clientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

async function limitLogin(kv: KvStore, ip: string): Promise<{ limited: boolean; retryAfter: number }> {
  if (await kv.get(`lock:login:${ip}`)) {
    return { limited: true, retryAfter: LOGIN_WINDOW_SECONDS }
  }
  const count = Number((await kv.get(`rl:login:${ip}`)) ?? '0')
  if (count >= LOGIN_MAX_ATTEMPTS) {
    return { limited: true, retryAfter: LOGIN_WINDOW_SECONDS }
  }
  // 滑动窗口：每次尝试顺延 TTL
  await kv.put(`rl:login:${ip}`, String(count + 1), { expirationTtl: LOGIN_WINDOW_SECONDS })
  return { limited: false, retryAfter: 0 }
}

async function recordFailure(kv: KvStore, ip: string): Promise<void> {
  const key = `fail:login:${ip}`
  const failures = Number((await kv.get(key)) ?? '0') + 1
  await kv.put(key, String(failures), { expirationTtl: LOGIN_WINDOW_SECONDS })
  if (failures >= LOGIN_MAX_FAILURES) {
    await kv.put(`lock:login:${ip}`, '1', { expirationTtl: LOGIN_WINDOW_SECONDS })
  }
}

async function clearFailures(kv: KvStore, ip: string): Promise<void> {
  await kv.delete(`fail:login:${ip}`)
  await kv.delete(`rl:login:${ip}`)
}

/* ------------------------------- 配置检查 ------------------------------- */

/** 返回缺失项列表；空数组表示配置齐全。 */
export function missingConfig(env: ServerEnv): string[] {
  const missing: string[] = []
  if (!env.CAP_SECRET || env.CAP_SECRET.length < 16) missing.push('CAP_SECRET')
  if (!env.ADMIN_KV) missing.push('ADMIN_KV（KV 命名空间）')
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 8) missing.push('ADMIN_PASSWORD')
  return missing
}

/* ------------------------------- 各路由 ------------------------------- */

async function capChallenge(env: ServerEnv): Promise<Response> {
  return jsonResponse(
    await generateChallenge(env.CAP_SECRET as string, {
      scope: ADMIN_CAP_SCOPE,
      instrumentation: true,
    }),
  )
}

async function capRedeem(request: Request, env: ServerEnv): Promise<Response> {
  const kv = env.ADMIN_KV as KvStore
  const body = (await request.json()) as ValidateChallengeBody
  const result = await validateChallenge(env.CAP_SECRET as string, body, {
    scope: ADMIN_CAP_SCOPE,
    tokenTtlMs: CAP_TOKEN_TTL_MS,
    consumeNonce: kvNonceConsumer(kv),
  })

  // 通过后把凭证记进 KV，登录时一次性消费。
  // 用「整串 token 的 sha256」作键，因此不依赖 capjs-core 的 token 格式。
  if (result.success) {
    await kv.put(`captoken:${await sha256Hex(result.token)}`, String(result.expires), {
      expirationTtl: Math.ceil(CAP_TOKEN_TTL_MS / 1000),
    })
  }

  return jsonResponse(result)
}

async function login(request: Request, env: ServerEnv): Promise<Response> {
  const kv = env.ADMIN_KV as KvStore
  const ip = clientIp(request)

  const limited = await limitLogin(kv, ip)
  if (limited.limited) {
    return jsonResponse({ error: 'rate_limited', retryAfter: limited.retryAfter }, 429, {
      'retry-after': String(limited.retryAfter),
    })
  }

  const body = (await request.json().catch(() => null)) as { password?: string; capToken?: string } | null
  const fail = async (): Promise<Response> => {
    await recordFailure(kv, ip)
    // 不区分「密码错」还是「验证码错」
    return jsonResponse({ error: 'invalid_credentials' }, 401)
  }

  if (!body?.capToken) return fail()

  // 先消耗验证码凭证：同一个凭证不能反复用来试密码
  const tokenKey = `captoken:${await sha256Hex(body.capToken)}`
  if (!(await kv.get(tokenKey))) return fail()
  await kv.delete(tokenKey)

  if (!(await passwordMatches(env, String(body.password ?? '')))) return fail()

  await clearFailures(kv, ip)
  const { token, expiresAt } = await signSession(env)
  return jsonResponse({ ok: true, expiresAt }, 200, {
    'set-cookie': sessionCookie(request, token, SESSION_TTL_SECONDS),
  })
}

async function session(request: Request, env: ServerEnv): Promise<Response> {
  const missing = missingConfig(env)
  if (missing.length > 0) {
    // 配置不全时仍然回答，让页面能显示明确的提示而不是白屏
    return jsonResponse({ authenticated: false, configured: false, missing })
  }
  const token = readCookie(request, SESSION_COOKIE)
  const payload = token ? await verifySession(env, token) : null
  return jsonResponse({
    authenticated: Boolean(payload),
    configured: true,
    expiresAt: payload?.exp ?? null,
  })
}

async function logout(request: Request): Promise<Response> {
  return jsonResponse({ ok: true }, 200, {
    'set-cookie': sessionCookie(request, '', 0),
  })
}

/* ------------------------------- 入口 ------------------------------- */

export async function handleAdminApi(request: Request, env: ServerEnv): Promise<Response> {
  const pathname = new URL(request.url).pathname
  const route = pathname.slice(ADMIN_API_BASE.length).replace(/\/+$/, '')
  const method = request.method

  // session 是只读的，允许在未配置时也回答
  if (route === 'session') {
    if (method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)
    return session(request, env)
  }

  // 内容接口用 GET/PUT/DELETE，且必须已登录
  if (route === 'content') {
    if (method !== 'GET' && method !== 'PUT' && method !== 'DELETE') {
      return jsonResponse({ error: 'method_not_allowed' }, 405)
    }
    if (!(await hasAdminSession(request, env))) {
      return jsonResponse({ error: 'unauthorized' }, 401)
    }
    const origin = request.headers.get('origin')
    if (method !== 'GET' && origin && origin !== new URL(request.url).origin) {
      return jsonResponse({ error: 'forbidden' }, 403)
    }
    const missingKv = missingConfig(env)
    if (!env.ADMIN_KV) {
      return jsonResponse(
        { error: 'server_not_configured', missing: missingKv, message: '缺少 ADMIN_KV' },
        503,
      )
    }
    return handleAdminContent(request, env)
  }

  if (method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  const missing = missingConfig(env)
  if (missing.length > 0) {
    return jsonResponse(
      { error: 'server_not_configured', missing, message: `后端缺少：${missing.join('、')}` },
      503,
    )
  }

  // 跨站提交直接拒绝（登录是未认证端点，这仍能挡掉被第三方页面驱动的提交）
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return jsonResponse({ error: 'forbidden' }, 403)
  }

  try {
    switch (route) {
      case 'cap/challenge':
        return await capChallenge(env)
      case 'cap/redeem':
        return await capRedeem(request, env)
      case 'login':
        return await login(request, env)
      case 'logout':
        return await logout(request)
      case 'github/snapshot':
        return await handleSnapshotRefresh(env)
      default:
        return jsonResponse({ error: 'not_found' }, 404)
    }
  } catch (error) {
    return jsonResponse(
      { error: 'internal_error', message: error instanceof Error ? error.message : String(error) },
      500,
    )
  }
}