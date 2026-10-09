import { formatMonth, languageColor } from '../data/projects'
import { ICON, h, svgIcon } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'
import type { Project } from '../types'
import { todoBadge } from './shared'

/**
 * MIUIX OverlayDialog 风格的项目详情弹层。
 *
 * 单例：DOM 只建一次并挂在 body 上，因此语言切换时的整页重渲染不会把它冲掉，
 * 只需调用 rerenderSheet() 刷新文案。
 */
let scrim: HTMLElement | null = null
let sheet: HTMLElement | null = null
let body: HTMLElement | null = null
let current: Project | null = null
let lastFocused: HTMLElement | null = null

function metaRow(
  key: string,
  value: string,
  options: { dotColor?: string; href?: string } = {},
): HTMLElement {
  const valueNode = h('span', { class: 'sheet__meta-v' })
  if (options.dotColor) {
    valueNode.append(
      h('span', { class: 'dot', style: `--dot:${options.dotColor}` }),
      document.createTextNode(' '),
    )
  }
  if (options.href) {
    valueNode.append(
      h('a', {
        href: options.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: value,
      }),
    )
  } else {
    valueNode.append(document.createTextNode(value))
  }
  return h('div', { class: 'sheet__meta-row' }, [
    h('span', { class: 'sheet__meta-k', text: key }),
    valueNode,
  ])
}

function renderBody(project: Project): void {
  if (!body) return
  const d = dict(state.lang)
  body.replaceChildren()

  body.append(
    h('h2', { class: 'sheet__title', id: 'sheet-title', text: d['detail.title'] }),
    h('div', { class: 'sheet__name', text: project.name }),
  )

  const description = h('p', { class: 'sheet__desc' })
  const text = project.description[state.lang]
  if (text) {
    description.textContent = text
  } else {
    description.textContent = d['projects.todo']
    const badge = todoBadge()
    if (badge) description.append(badge)
  }
  body.append(description)

  const meta = h('div', { class: 'sheet__meta' }, [
    metaRow(d['detail.language'], project.language ?? d['detail.none'], {
      dotColor: project.language ? languageColor(project.language) : undefined,
    }),
    metaRow(d['detail.stars'], String(project.stars)),
    metaRow(d['detail.updated'], formatMonth(project.updated, state.lang)),
  ])
  if (project.homepage) {
    meta.append(metaRow(d['detail.homepage'], project.homepage, { href: project.homepage }))
  }
  body.append(meta)

  const close = h('button', { class: 'btn btn--ghost', type: 'button', text: d['a11y.close'] })
  close.addEventListener('click', () => closeSheet())

  body.append(h('div', { class: 'sheet__acts' }, [
    close,
    h('a', {
      class: 'btn btn--primary',
      href: project.url,
      target: '_blank',
      rel: 'noopener noreferrer',
    }, [
      svgIcon(ICON.github),
      h('span', { text: d['detail.open'] }),
    ]),
  ]))
}

export function initSheet(): void {
  scrim = h('div', { class: 'scrim', 'data-open': 'false' })
  sheet = h('div', {
    class: 'sheet',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'sheet-title',
    'aria-hidden': 'true',
    'data-open': 'false',
  })
  body = h('div', { class: 'sheet__body' })
  sheet.append(body)

  scrim.addEventListener('click', () => closeSheet())
  document.body.append(scrim, sheet)

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !current) return
    event.preventDefault()
    closeSheet()
  })
}

export function openProjectSheet(project: Project, trigger?: HTMLElement): void {
  if (!sheet || !scrim) return
  current = project
  lastFocused = trigger ?? (document.activeElement as HTMLElement | null)
  renderBody(project)

  sheet.setAttribute('data-open', 'true')
  sheet.setAttribute('aria-hidden', 'false')
  scrim.setAttribute('data-open', 'true')
  document.body.style.overflow = 'hidden'

  sheet.querySelector<HTMLElement>('.btn--ghost')?.focus()
}

export function closeSheet(): void {
  if (!sheet || !scrim || !current) return
  current = null

  sheet.setAttribute('data-open', 'false')
  sheet.setAttribute('aria-hidden', 'true')
  scrim.setAttribute('data-open', 'false')
  document.body.style.overflow = ''

  lastFocused?.focus()
  lastFocused = null
}

/** 语言切换后刷新弹层文案（仅在打开状态下有意义）。 */
export function rerenderSheet(): void {
  if (current) renderBody(current)
}