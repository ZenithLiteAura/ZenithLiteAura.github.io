import 'cap-widget'
import type { CapErrorEvent, CapSolveEvent, CapWidget } from 'cap-widget'
import { h } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'
import { CAP_API_BASE } from './cap-shared'

/**
 * 探测 Cap 后端是否可用：发一次 challenge，看后端有没有返回合法 token。
 * 静态托管（GitHub Pages）上没有这个后端，于是页面会走「需要后端」的提示分支，
 * 而不是渲染一个永远报错的控件。
 *
 * 结果按页面加载缓存一次：语言/主题切换会整页重渲染，没有缓存的话每切一次就多一个无谓请求
 * （静态托管下还会多一条 404 日志）。
 */
let probeCache: boolean | null = null

export async function probeCapBackend(): Promise<boolean> {
  if (probeCache !== null) return probeCache
  try {
    const response = await fetch(`${CAP_API_BASE}challenge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      cache: 'no-store',
    })
    if (!response.ok) {
      probeCache = false
      return false
    }
    const data = (await response.json()) as { token?: unknown }
    probeCache = typeof data.token === 'string' && data.token.length > 0
    return probeCache
  } catch {
    probeCache = false
    return false
  }
}

function createCapWidget(onSolved: (token: string) => void, onFailed: (message: string) => void): CapWidget {
  const widget = document.createElement('cap-widget')
  widget.setAttribute('data-cap-api-endpoint', CAP_API_BASE)
  // widget 内置 zh-cn / zh-tw 翻译，这里只需要告诉它用哪个
  widget.setAttribute('data-cap-lang', state.lang === 'zh' ? 'zh-cn' : 'en')
  widget.addEventListener('solve', (event: CapSolveEvent) => onSolved(event.detail.token))
  widget.addEventListener('error', (event: CapErrorEvent) => onFailed(event.detail.message))
  return widget
}

/** 把 Cap 卡片的内容渲染进 host：加载中 → 控件 或「需要后端」提示。 */
export async function mountCapSlot(host: HTMLElement): Promise<void> {
  const d = dict(state.lang)

  host.replaceChildren(h('p', { class: 'muted', text: d['verify.capLoading'] }))

  const available = await probeCapBackend()
  // 语言切换会整页重渲染，旧的 host 已经不在文档里了，直接放弃
  if (!host.isConnected) return

  if (!available) {
    host.replaceChildren(
      h('p', { class: 'verify-callout', text: d['verify.capUnavailableTitle'] }),
      h('p', { class: 'muted', text: d['verify.capUnavailableBody'] }),
    )
    return
  }

  const status = h('p', { class: 'muted', text: d['verify.capHint'] })
  const widget = createCapWidget(
    (token) => {
      status.textContent = `${d['verify.capSolved']} ${token.slice(0, 16)}… (${token.length})`
    },
    (message) => {
      status.textContent = `${d['verify.capError']}: ${message}`
    },
  )

  host.replaceChildren(widget, status)
}