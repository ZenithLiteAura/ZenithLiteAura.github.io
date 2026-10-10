import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/motion.css'
import '../styles/cap-widget-theme.css'
// driftcha 的样式表：控件本身不自带注入，必须由使用者导入，
// 否则它就是一堆没有边框/间距/字号的裸元素（canvas 还会保持 520px 固有宽）。
import 'driftcha/style.css'
import './verify.css'

import type { Driftcha } from 'driftcha'
import { loadContentOverrides } from '../content/overrides'
import { dict } from '../i18n'
import { syncAppBarScroll } from '../sections/appbar'
import { applyTheme, state, subscribe } from '../store'
import { mountCapSlot } from './cap'
import { mountDriftcha } from './driftcha'
import { renderMotionGate, renderVerifyPage } from './layout'

function requireAppRoot(): HTMLElement {
  const element = document.getElementById('app')
  if (!element) throw new Error('缺少 #app 容器')
  return element
}

const root = requireAppRoot()

/** Driftcha 实例：语言/主题一变就要整块重挂载。 */
let driftcha: Driftcha | null = null
/** 用户在 reduced-motion 下是否已明确同意加载。 */
let motionOptIn = false

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function render(): void {
  const d = dict(state.lang)

  document.title = d['verify.metaTitle']
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', d['verify.metaDescription'])

  driftcha?.destroy()
  driftcha = null

  const refs = renderVerifyPage(root)

  // Driftcha：reduced-motion 时先不自动播放持续运动
  if (reduceMotion.matches && !motionOptIn) {
    refs.driftchaHost.append(
      renderMotionGate(() => {
        motionOptIn = true
        render()
      }),
    )
  } else {
    driftcha = mountDriftcha(refs.driftchaHost)
  }

  // Cap：异步探测后端，可用才挂控件
  void mountCapSlot(refs.capHost)

  syncAppBarScroll()
}

applyTheme()
document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en'

subscribe(render)

void (async () => {
  await loadContentOverrides()
  render()
})()

window.addEventListener('scroll', syncAppBarScroll, { passive: true })