import 'cap-widget'
import type { CapWidget } from 'cap-widget'
import { h } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'
import { CAP_API_BASE } from './cap-shared'

/**
 * 探测 Cap 后端是否可用：发一次 challenge，看后端有没有返回合法 token。
 * 静态托管（GitHub Pages）上没有这个后端，于是页面会显示一行提示，
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

function createCapWidget(): CapWidget {
  const widget = document.createElement('cap-widget')
  widget.setAttribute('data-cap-api-endpoint', CAP_API_BASE)
  // widget 内置 zh-cn / zh-tw 翻译，这里只需要告诉它用哪个
  widget.setAttribute('data-cap-lang', state.lang === 'zh' ? 'zh-cn' : 'en')
  return widget
}

/**
 * 把 Cap 控件挂进 host。
 *
 * 控件自己会显示「确认你是真人 / 正在验证 / 你是真人 / 出错」等状态，
 * 所以这里不再额外加一行状态文字。后端不可用时只留一行说明。
 */
export async function mountCapSlot(host: HTMLElement): Promise<void> {
  const d = dict(state.lang)

  const available = await probeCapBackend()
  // 语言切换会整页重渲染，旧的 host 已经不在文档里了，直接放弃
  if (!host.isConnected) return

  host.replaceChildren(
    available
      ? createCapWidget()
      : h('p', { class: 'verify-callout', text: d['verify.capUnavailableTitle'] }),
  )
}