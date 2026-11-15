/**
 * 验证页的「执行日志」+ 信标。
 *
 * 只记录真实发生的事：环境探测、Cap 接口的请求与耗时、Driftcha 的挂载与结果、
 * 以及发到 /verify/api/beacon 的往返延迟。没有假动画，也没有随机数字。
 */

export type LogKind = 'run' | 'ok' | 'warn' | 'note'

export interface Telemetry {
  log(kind: LogKind, text: string, extra?: string): void
  beacon(payload: Record<string, unknown>): Promise<number | null>
}

export const BEACON_PATH = '/verify/api/beacon'

const TAG: Record<LogKind, string> = { run: 'RUN ', ok: 'OK  ', warn: 'WARN', note: 'INFO' }

const pad2 = (n: number): string => String(n).padStart(2, '0')

const stamp = (): string => {
  const d = new Date()
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${ms}`
}

export function createTelemetry(host: HTMLElement): Telemetry {
  const startedAt = performance.now()
  const lines = document.createElement('div')
  lines.className = 'v-log__lines'
  host.replaceChildren(lines)

  const log = (kind: LogKind, text: string, extra?: string): void => {
    const line = document.createElement('p')
    line.className = 'v-log__line'
    line.dataset.kind = kind

    const time = document.createElement('span')
    time.className = 'v-log__t'
    time.textContent = stamp()

    const tag = document.createElement('span')
    tag.className = 'v-log__tag'
    tag.textContent = TAG[kind]

    const msg = document.createElement('span')
    msg.className = 'v-log__msg'
    msg.textContent = text

    line.append(time, tag, msg)
    if (extra) {
      const tail = document.createElement('span')
      tail.className = 'v-log__ex'
      tail.textContent = extra
      line.append(tail)
    }

    lines.append(line)
    host.scrollTop = host.scrollHeight
    // 面板不能无限长：超过 60 行丢最早的
    while (lines.children.length > 60) lines.firstElementChild?.remove()
  }

  /* 环境探测：这些都是浏览器里真实可读的值 */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canvas2d = Boolean(document.createElement('canvas').getContext('2d'))
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection

  log('run', 'session start', location.host)
  log('note', 'env · display', `dpr ${devicePixelRatio.toFixed(2)} · ${innerWidth}×${innerHeight}`)
  log('note', 'env · cpu/net', `${navigator.hardwareConcurrency ?? '?'} threads · ${connection?.effectiveType ?? 'n/a'}`)
  log('note', 'env · timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
  log('note', 'env · capability', `crypto.subtle ${crypto?.subtle ? 'yes' : 'no'} · canvas2d ${canvas2d ? 'yes' : 'no'}`)
  log(reduced ? 'warn' : 'note', 'env · motion', reduced ? 'reduce（已降级）' : 'no-preference')

  const beacon = async (payload: Record<string, unknown>): Promise<number | null> => {
    const t0 = performance.now()
    try {
      const response = await fetch(BEACON_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, elapsedMs: Math.round(performance.now() - startedAt) }),
        cache: 'no-store',
        keepalive: true,
      })
      const ms = Math.round(performance.now() - t0)
      if (response.ok) {
        log('ok', `beacon ${response.status}`, `RTT ${ms}ms · 总耗时 ${Math.round(performance.now() - startedAt)}ms`)
      } else {
        log('warn', `beacon ${response.status}`, `${ms}ms`)
      }
      return ms
    } catch {
      log('warn', 'beacon 发送失败', 'offline?')
      return null
    }
  }

  return { log, beacon }
}

/**
 * 给 Cap 的接口请求计时：把 window.fetch 包一层，只拦 /verify/cap/*。
 * 返回还原函数，避免切语言重渲染时叠加多层包装。
 */
export function instrumentCapFetch(log: (kind: LogKind, text: string, extra?: string) => void): () => void {
  const original = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (!url.includes('/verify/cap/')) return original(input, init)

    const route = url.split('/verify/cap/')[1]?.split('?')[0] ?? ''
    const t0 = performance.now()
    try {
      const response = await original(input, init)
      log(response.ok ? 'ok' : 'warn', `cap ${route} → ${response.status}`, `${Math.round(performance.now() - t0)}ms`)
      return response
    } catch (error) {
      log('warn', `cap ${route} 失败`, String(error).slice(0, 48))
      throw error
    }
  }

  return () => {
    window.fetch = original
  }
}