/**
 * 验证页信标：前端在每一步/结束时丢一个很小的 JSON 过来，
 * 只回服务端时间 + 收到的阶段数，不做任何存储（无 cookie、无标识）。
 * 前端拿它算真实往返延迟，日志里那条 "beacon → 200 · 42ms" 就是它的 RTT。
 */

export const BEACON_PATH = '/verify/api/beacon'

const MAX_STAGES = 8

export async function handleBeacon(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const stages = Number(source.stages)
  const elapsed = Number(source.elapsedMs)

  const payload = {
    ok: true,
    serverTime: new Date().toISOString(),
    received: {
      stages: Number.isFinite(stages) ? Math.max(0, Math.min(MAX_STAGES, Math.trunc(stages))) : 0,
      elapsedMs: Number.isFinite(elapsed) ? Math.max(0, Math.min(600000, Math.round(elapsed))) : 0,
    },
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
