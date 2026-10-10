import { h } from '../dom'
import { dict } from '../i18n'
import { renderTopBar } from '../sections/appbar'
import { state } from '../store'

export interface VerifyPageRefs {
  /** Driftcha 的挂载点 */
  driftchaHost: HTMLElement
  /** Cap 的挂载点 */
  capHost: HTMLElement
}

/**
 * /verify/ 只放两个验证码本体。
 *
 * 没有说明文字、没有对比表、也没有卡片外壳——两个控件各自带边框与背景，
 * 再套一层卡片就成了双层边框。顶栏保留，因为语言/主题开关会直接作用到两个控件上
 * （driftcha 的文案与配色、cap-widget 的 data-cap-lang 与 --cap-* 变量都由它驱动）。
 */
export function renderVerifyPage(root: HTMLElement): VerifyPageRefs {
  const d = dict(state.lang)

  const driftchaHost = h('div', { class: 'verify-widget', id: 'driftcha' })
  const capHost = h('div', { class: 'verify-widget', id: 'cap' })

  const page = h('div', { class: 'page verify-page' }, [driftchaHost, capHost])

  root.replaceChildren(renderTopBar(d['verify.title'], '', '/'), page)
  return { driftchaHost, capHost }
}

/** reduced-motion 时不自动播放，只留一个按钮把决定权交给用户。 */
export function renderMotionGate(onLoad: () => void): HTMLElement {
  const d = dict(state.lang)
  const button = h('button', {
    class: 'btn btn--primary',
    type: 'button',
    text: d['verify.motionLoad'],
  })
  button.addEventListener('click', onLoad)
  return h('div', { class: 'verify-gate' }, [button])
}