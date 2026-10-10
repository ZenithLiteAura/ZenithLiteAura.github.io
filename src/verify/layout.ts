import { profile } from '../data/profile'
import { h } from '../dom'
import { dict } from '../i18n'
import { renderTopBar } from '../sections/appbar'
import { state } from '../store'
import { comparisonRows } from './comparison'

export interface VerifyPageRefs {
  /** Driftcha 的挂载点 */
  driftchaHost: HTMLElement
  /** Cap 的挂载点 */
  capHost: HTMLElement
}

function comparisonTable(): HTMLElement {
  const d = dict(state.lang)
  const head = h('tr', {}, [
    h('th', { text: d['verify.colFeature'] }),
    h('th', { text: d['verify.colDriftcha'] }),
    h('th', { text: d['verify.colCap'] }),
  ])

  const body = h('tbody')
  for (const row of comparisonRows) {
    body.append(
      h('tr', {}, [
        h('td', { class: 'cmp__feature', text: row.feature[state.lang] }),
        h('td', { class: row.winner === 'driftcha' ? 'is-better' : '', text: row.driftcha[state.lang] }),
        h('td', { class: row.winner === 'cap' ? 'is-better' : '', text: row.cap[state.lang] }),
      ]),
    )
  }

  return h('div', { class: 'cmp-wrap' }, [
    h('table', { class: 'cmp' }, [h('thead', {}, [head]), body]),
  ])
}

export function renderVerifyPage(root: HTMLElement): VerifyPageRefs {
  const d = dict(state.lang)

  const driftchaHost = h('div', { class: 'verify-widget', id: 'driftcha' })
  const capHost = h('div', { class: 'verify-widget', id: 'cap' })

  const page = h('div', { class: 'page' })

  page.append(
    h('section', { class: 'section' }, [
      h('div', { class: 'card card--pad' }, [
        h('p', { class: 'about__text', text: d['verify.lead'] }),
      ]),
    ]),

    h('section', { class: 'section' }, [
      h('h2', { class: 'group-title', text: d['verify.tableTitle'] }),
      h('div', { class: 'card card--pad' }, [comparisonTable()]),
    ]),

    h('section', { class: 'section' }, [
      h('h2', { class: 'group-title', text: d['verify.driftchaTitle'] }),
      h('div', { class: 'card card--pad verify-card' }, [
        h('span', { class: 'verify-badge', text: d['verify.driftchaMode'] }),
        driftchaHost,
        h('p', { class: 'muted', text: d['verify.driftchaNote'] }),
      ]),
    ]),

    h('section', { class: 'section' }, [
      h('h2', { class: 'group-title', text: d['verify.capTitle'] }),
      h('div', { class: 'card card--pad verify-card' }, [capHost]),
    ]),

    h('section', { class: 'section' }, [
      h('h2', { class: 'group-title', text: d['verify.a11yTitle'] }),
      h('div', { class: 'card card--pad' }, [
        h('p', { class: 'about__text', text: d['verify.a11yBody'] }),
        h('p', { class: 'verify-mail' }, [
          h('a', { href: `mailto:${profile.email}`, text: profile.email }),
        ]),
      ]),
    ]),

    h('footer', { class: 'footer' }, [
      h('div', { text: d['verify.footnote'] }),
      h('div', {}, [
        h('a', { href: '/', text: d['verify.back'] }),
        document.createTextNode(` · © ${new Date().getFullYear()} ${profile.login}`),
      ]),
    ]),
  )

  root.replaceChildren(renderTopBar(d['verify.title'], d['verify.subtitle']), page)
  return { driftchaHost, capHost }
}

/** reduced-motion 下的加载闸门：这是 Driftcha 卡片里显示的内容。 */
export function renderMotionGate(onLoad: () => void): HTMLElement {
  const d = dict(state.lang)
  const button = h('button', { class: 'btn btn--primary', type: 'button', text: d['verify.motionLoad'] })
  button.addEventListener('click', onLoad)

  return h('div', { class: 'verify-gate' }, [
    h('p', { class: 'verify-callout', text: d['verify.motionTitle'] }),
    h('p', { class: 'muted', text: d['verify.motionBody'] }),
    h('div', { class: 'verify-gate__act' }, [button]),
  ])
}