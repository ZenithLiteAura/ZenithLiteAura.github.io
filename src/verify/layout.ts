import { h } from '../dom'
import { dict } from '../i18n'
import { renderTopBar } from '../sections/appbar'
import { state } from '../store'

export interface VerifyPageRefs {
  /** Driftcha 的挂载点（第 02 步） */
  driftchaHost: HTMLElement
  /** Cap 的挂载点（第 01 步） */
  capHost: HTMLElement
  /** 第 02 步整块（锁定态加 data-locked） */
  step2: HTMLElement
  /** 第 02 步的状态标签 */
  step2State: HTMLElement
  /** 结果卡 */
  done: HTMLElement
}

export interface VerifyPageOptions {
  capPassed: boolean
  driftchaPassed: boolean
  onRestart: () => void
}

function stepHead(index: string, title: string, stateEl?: HTMLElement): HTMLElement {
  return h('div', { class: 'v-step__head' }, [
    h('span', { class: 'v-idx mono', text: index }),
    h('h2', { class: 'v-step__title', text: title }),
    h('span', { class: 'v-rule' }),
    ...(stateEl ? [stateEl] : []),
  ])
}

/**
 * /verify/ 的两步验证页。
 *
 * 01 Cap（点一下就好）→ 通过后才解锁 02 Driftcha（读噪点里的数字）→ 两步都过弹结果卡。
 * 页面结构跟首页同一套语言：等宽小标 + 衬线标题 + 编号 + 细分割线。
 */
export function renderVerifyPage(root: HTMLElement, options: VerifyPageOptions): VerifyPageRefs {
  const d = dict(state.lang)

  const capState = h('span', {
    class: 'v-state mono',
    'data-state': options.capPassed ? 'passed' : 'waiting',
    text: options.capPassed ? d['verify.stepPassed'] : d['verify.stepWaiting'],
  })
  const step2State = h('span', {
    class: 'v-state mono',
    'data-state': options.driftchaPassed ? 'passed' : options.capPassed ? 'waiting' : 'locked',
    text: options.driftchaPassed
      ? d['verify.stepPassed']
      : options.capPassed
        ? d['verify.stepWaiting']
        : d['verify.stepLockedChip'],
  })

  const capHost = h('div', { class: 'verify-widget', id: 'cap' })
  const driftchaHost = h('div', { class: 'verify-widget', id: 'driftcha' })

  const step2Body = h('div', { class: 'v-step__body' }, [driftchaHost])
  const lockedNote = h('p', { class: 'v-locked mono', text: d['verify.stepLocked'] })
  const step2 = h('section', { class: 'v-step', 'data-locked': options.capPassed ? 'false' : 'true' }, [
    stepHead('02', d['verify.step2Title'], step2State),
    h('p', { class: 'v-step__sub', text: d['verify.step2Sub'] }),
    lockedNote,
    step2Body,
  ])

  const restart = h('button', {
    class: 'v-btn mono',
    type: 'button',
    text: d['verify.restart'],
  })
  restart.addEventListener('click', options.onRestart)

  const done = h('section', { class: 'v-done', hidden: !(options.capPassed && options.driftchaPassed) }, [
    h('div', { class: 'v-done__mark', 'aria-hidden': 'true', text: '✓' }),
    h('h2', { class: 'v-done__title', text: d['verify.doneTitle'] }),
    h('p', { class: 'v-done__body', text: d['verify.doneBody'] }),
    h('p', { class: 'v-done__meta mono', text: d['verify.doneMeta'] }),
    restart,
  ])

  const page = h('div', { class: 'page verify-page' }, [
    h('p', { class: 'v-overline mono', text: d['verify.overline'] }),
    h('p', { class: 'v-lede', text: d['verify.lede'] }),
    h('section', { class: 'v-step', 'data-locked': 'false' }, [
      stepHead('01', d['verify.step1Title'], capState),
      h('p', { class: 'v-step__sub', text: d['verify.step1Sub'] }),
      h('div', { class: 'v-step__body' }, [capHost]),
    ]),
    step2,
    done,
  ])

  root.replaceChildren(renderTopBar(d['verify.title'], '', '/'), page)
  return { driftchaHost, capHost, step2, step2State, done }
}

/** reduced-motion 时不自动播放，只留一个按钮把决定权交给用户。 */
export function renderMotionGate(onLoad: () => void): HTMLElement {
  const d = dict(state.lang)
  const button = h('button', {
    class: 'v-btn mono',
    type: 'button',
    text: d['verify.motionLoad'],
  })
  button.addEventListener('click', onLoad)
  return h('div', { class: 'verify-gate' }, [button])
}