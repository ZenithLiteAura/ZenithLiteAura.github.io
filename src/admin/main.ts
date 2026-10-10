import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/motion.css'
import '../styles/cap-widget-theme.css'
import './admin.css'

import 'cap-widget'
// 浮动模式脚本：IIFE，副作用导入即可（该包没有 exports 字段，所以子路径可达）
import 'cap-widget/cap-floating.min.js'

import { ADMIN_API_BASE } from './admin-shared'
import { h } from '../dom'
import { dict } from '../i18n'
import { applyTheme, state, subscribe } from '../store'
import { renderLogin } from './login'

/**
 * 后台页面：先问一次会话（GET /admin/api/session），再决定显示登录表单还是面板。
 * GitHub Pages 上没有后端，会话请求会失败 → 显示「需要后端」的提示。
 */

interface SessionState {
  status: 'checking' | 'ready' | 'no-backend'
  authenticated: boolean
  configured: boolean
  expiresAt: number | null
  missing: string[]
}

let session: SessionState = {
  status: 'checking',
  authenticated: false,
  configured: true,
  expiresAt: null,
  missing: [],
}

function requireRoot(): HTMLElement {
  const element = document.getElementById('app')
  if (!element) throw new Error('缺少 #app 容器')
  return element
}

const root = requireRoot()

function formatExpiry(ms: number): string {
  return new Intl.DateTimeFormat(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms))
}

function shell(title: string, subtitle: string, content: HTMLElement): HTMLElement {
  return h('main', { class: 'admin-shell' }, [
    h('div', { class: 'card card--pad admin-card' }, [
      h('h1', { class: 'admin-title', text: title }),
      h('p', { class: 'admin-sub', text: subtitle }),
      content,
    ]),
  ])
}

function renderPanel(): HTMLElement {
  const d = dict(state.lang)
  const expires = session.expiresAt ? formatExpiry(session.expiresAt) : '—'
  const signOut = h('button', {
    type: 'button',
    class: 'btn btn--ghost admin-submit',
    text: d['admin.signOut'],
  })
  signOut.addEventListener('click', () => {
    void signOutRequest()
  })

  return h('div', { class: 'admin-panel' }, [
    h('p', { class: 'admin-status', text: `${d['admin.sessionExpires']}：${expires}` }),
    h('p', { class: 'admin-hint', text: d['admin.panelBody'] }),
    signOut,
  ])
}

async function signOutRequest(): Promise<void> {
  try {
    await fetch(`${ADMIN_API_BASE}logout`, { method: 'POST' })
  } catch {
    /* 离线也要让本地状态回到未登录 */
  }
  session = { status: 'ready', authenticated: false, configured: true, expiresAt: null, missing: [] }
  render()
}

function render(): void {
  const d = dict(state.lang)

  document.title = d['admin.metaTitle']
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', d['admin.metaDescription'])

  if (session.status === 'checking') {
    root.replaceChildren(shell(d['admin.title'], d['admin.subtitle'], notice(d['admin.checking'])))
    return
  }
  if (session.status === 'no-backend') {
    root.replaceChildren(shell(d['admin.title'], d['admin.subtitle'], notice(d['admin.errorNoBackend'], true)))
    return
  }
  if (!session.configured) {
    root.replaceChildren(
      shell(
        d['admin.title'],
        d['admin.subtitle'],
        notice(d['admin.errorNotConfigured'].replace('{missing}', session.missing.join('、')), true),
      ),
    )
    return
  }
  if (session.authenticated) {
    root.replaceChildren(shell(d['admin.panelTitle'], d['admin.panelSubtitle'], renderPanel()))
    return
  }

  root.replaceChildren(
    shell(d['admin.title'], d['admin.subtitle'], renderLogin((expiresAt) => {
      session = { status: 'ready', authenticated: true, configured: true, expiresAt, missing: [] }
      render()
    })),
  )
}

function notice(text: string, isError = false): HTMLElement {
  return h('p', { class: 'admin-status', style: 'min-height:0', ...(isError ? { 'data-kind': 'error' } : {}) , text })
}

async function loadSession(): Promise<void> {
  try {
    const response = await fetch(`${ADMIN_API_BASE}session`, { cache: 'no-store' })
    if (!response.ok) throw new Error(String(response.status))
    const data = (await response.json()) as {
      authenticated?: boolean
      configured?: boolean
      expiresAt?: number | null
      missing?: string[]
    }
    session = {
      status: 'ready',
      authenticated: Boolean(data.authenticated),
      configured: data.configured !== false,
      expiresAt: data.expiresAt ?? null,
      missing: data.missing ?? [],
    }
  } catch {
    session = { status: 'no-backend', authenticated: false, configured: true, expiresAt: null, missing: [] }
  }
  render()
}

applyTheme()
document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en'

subscribe(render)
render()
void loadSession()