import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/motion.css'
import '../styles/cap-widget-theme.css'
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
import type { VerifyPageRefs } from './layout'

function requireAppRoot(): HTMLElement {
  const element = document.getElementById('app')
  if (!element) throw new Error('缺少 #app 容器')
  return element
}

const root = requireAppRoot()

/** 两步的通过状态；语言/主题重渲染时要保住它们。 */
const passed = { cap: false, driftcha: false }

let driftcha: Driftcha | null = null
let refs: VerifyPageRefs | null = null
let motionOptIn = false

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function allPassed(): boolean {
  return passed.cap && passed.driftcha
}

/** 第 02 步：通过后解锁；reduced-motion 未同意时先给一个按钮。 */
function mountStep2(target: VerifyPageRefs): void {
  driftcha?.destroy()
  driftcha = null
  target.driftchaHost.replaceChildren()

  if (!passed.cap) {
    target.step2.dataset.locked = 'true'
    return
  }

  target.step2.dataset.locked = 'false'
  // 解锁后状态从「锁定」变「待完成」
  target.step2State.dataset.state = 'waiting'
  target.step2State.textContent = dict(state.lang)['verify.stepWaiting']

  if (reduceMotion.matches && !motionOptIn) {
    target.driftchaHost.append(
      renderMotionGate(() => {
        motionOptIn = true
        mountStep2(target)
      }),
    )
    return
  }

  driftcha = mountDriftcha(target.driftchaHost, {
    onSuccess: () => {
      passed.driftcha = true
      revealDone()
    },
  })
}

function revealDone(): void {
  if (!refs) return
  refs.step2State.dataset.state = 'passed'
  refs.step2State.textContent = dict(state.lang)['verify.stepPassed']
  refs.done.hidden = !allPassed()
  if (allPassed()) refs.done.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function render(): void {
  const d = dict(state.lang)

  document.title = d['verify.metaTitle']
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', d['verify.metaDescription'])

  driftcha?.destroy()
  driftcha = null

  refs = renderVerifyPage(root, {
    capPassed: passed.cap,
    driftchaPassed: passed.driftcha,
    onRestart: () => {
      passed.cap = false
      passed.driftcha = false
      render()
    },
  })

  // 01 Cap：解出凭证即算通过，然后解锁第 02 步
  void mountCapSlot(refs.capHost, () => {
    if (passed.cap) return
    passed.cap = true
    const capState = root.querySelector('.v-step .v-state')
    if (capState instanceof HTMLElement) {
      capState.dataset.state = 'passed'
      capState.textContent = d['verify.stepPassed']
    }
    if (refs) mountStep2(refs)
  })

  mountStep2(refs)
  syncAppBarScroll()
}

document.body.classList.add('verify-shell')
applyTheme()
document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en'

subscribe(render)

void (async () => {
  await loadContentOverrides()
  render()
})()

window.addEventListener('scroll', syncAppBarScroll, { passive: true })

// 仅开发期：给自动化测试一个"两步都通过"的入口（生产构建会被 tree-shake 掉）
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__verifyTest = {
    passAll() {
      passed.cap = true
      passed.driftcha = true
      render()
    },
    state: () => ({ ...passed }),
  }
}