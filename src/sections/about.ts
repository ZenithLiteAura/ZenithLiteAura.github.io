import { profile } from '../data/profile'
import { h } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'
import { todoBadge } from './shared'

export function renderAbout(): HTMLElement {
  const d = dict(state.lang)
  const paragraph = h('p', { class: 'about__text', text: profile.bio[state.lang] })

  return h('section', { class: 'section' }, [
    h('h2', { class: 'group-title', text: d['section.about'] }),
    h('div', { class: 'card card--pad' }, [paragraph]),
  ])
}

export function renderSkills(): HTMLElement {
  const d = dict(state.lang)
  const chips = h('div', { class: 'chips' })
  for (const skill of profile.skills) {
    chips.append(h('span', { class: 'chip', text: skill }))
  }

  const children: (Node | string)[] = [chips]
  const hint = todoBadge()
  if (hint) {
    children.push(h('p', { class: 'muted todo-line' }, [hint, h('span', { text: d['skills.hint'] })]))
  }

  return h('section', { class: 'section' }, [
    h('h2', { class: 'group-title', text: d['section.skills'] }),
    h('div', { class: 'card card--pad' }, children),
  ])
}