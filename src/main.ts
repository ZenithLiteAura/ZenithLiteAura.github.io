import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/motion.css'

import { renderApp } from './app'
import { dict } from './i18n'
import { initSheet, rerenderSheet } from './sections/sheet'
import { applyTheme, state, subscribe } from './store'

/** 取挂载点。用显式返回类型，避免闭包里丢失非空收窄。 */
function requireAppRoot(): HTMLElement {
  const element = document.getElementById('app')
  if (!element) throw new Error('缺少 #app 容器')
  return element
}

const root = requireAppRoot()

initSheet()
applyTheme()
document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en'

/** 滚动超过一点点就把顶栏玻璃化并收起大标题（MIUIX 大标题折叠）。 */
function syncScrollState(): void {
  document
    .getElementById('appbar')
    ?.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false')
}

let firstRender = true

function render(): void {
  const d = dict(state.lang)

  document.title = d['meta.title']
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', d['meta.description'])

  renderApp(root, firstRender)
  firstRender = false

  rerenderSheet()
  syncScrollState()
}

subscribe(render)
render()

window.addEventListener('scroll', syncScrollState, { passive: true })