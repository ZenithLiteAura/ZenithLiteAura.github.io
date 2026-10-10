import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/motion.css'

import { renderApp } from './app'
import { loadContentOverrides } from './content/overrides'
import { dict } from './i18n'
import { syncAppBarScroll } from './sections/appbar'
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
  syncAppBarScroll()
}

subscribe(render)

// 先拉内容覆盖再首次渲染：拿到就用 KV 里的内容，拿不到就用构建时的默认值
void (async () => {
  await loadContentOverrides()
  render()
})()

window.addEventListener('scroll', syncAppBarScroll, { passive: true })