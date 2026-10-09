import { profile } from '../data/profile'
import { formatMonth, languageColor, ownProjects, publicRepoCount } from '../data/projects'
import { ICON, h, svgIcon } from '../dom'
import { dict, t } from '../i18n'
import { state } from '../store'
import type { Project } from '../types'
import { externalIcon, todoBadge } from './shared'
import { openProjectSheet } from './sheet'

function projectCard(project: Project): HTMLElement {
  const d = dict(state.lang)
  const name = project.name

  const card = h('button', {
    class: 'card project',
    type: 'button',
    'aria-label': `${name} — ${d['a11y.openDetail']}`,
  })

  const inner = h('span', { class: 'project__inner' })

  const chev = svgIcon(ICON.chevron)
  chev.setAttribute('class', 'project__chev')
  inner.append(h('span', { class: 'project__head' }, [
    h('span', { class: 'project__name', text: name }),
    chev,
  ]))

  const description = h('span', { class: 'project__desc' })
  const text = project.description[state.lang]
  if (text) {
    description.textContent = text
  } else {
    description.textContent = d['projects.todo']
    const badge = todoBadge()
    if (badge) description.append(badge)
  }
  inner.append(description)

  const meta = h('span', { class: 'project__meta' })
  if (project.language) {
    meta.append(h('span', { class: 'project__lang' }, [
      h('span', { class: 'dot', style: `--dot:${languageColor(project.language)}` }),
      h('span', { text: project.language }),
    ]))
  }
  const star = svgIcon(ICON.star)
  star.setAttribute('class', 'project__ico')
  meta.append(h('span', { class: 'project__star' }, [
    star,
    h('span', { text: `${project.stars} ${d['projects.stars']}` }),
  ]))
  meta.append(h('span', {
    text: `${d['projects.updated']} ${formatMonth(project.updated, state.lang)}`,
  }))
  if (project.archived) {
    meta.append(h('span', { class: 'todo', text: d['projects.archived'] }))
  }
  inner.append(meta)

  card.append(inner)
  card.addEventListener('click', () => openProjectSheet(project, card))
  return card
}

export function renderProjects(): HTMLElement {
  const d = dict(state.lang)

  const stack = h('div', { class: 'stack' })
  if (ownProjects.length === 0) {
    stack.append(h('div', { class: 'card card--pad muted', text: d['projects.empty'] }))
  }
  for (const project of ownProjects) {
    stack.append(projectCard(project))
  }

  const viewAll = h('div', { class: 'card view-all' }, [
    h('a', {
      class: 'row',
      href: `${profile.github}?tab=repositories`,
      target: '_blank',
      rel: 'noopener noreferrer',
    }, [
      h('span', { class: 'row__text' }, [
        h('span', {
          class: 'row__t',
          text: t(state.lang, 'projects.viewAll', { n: publicRepoCount }),
        }),
        h('span', { class: 'row__s', text: 'github.com/ZenithLiteAura' }),
      ]),
      externalIcon(),
    ]),
  ])

  return h('section', { class: 'section' }, [
    h('h2', { class: 'group-title', text: d['section.projects'] }),
    stack,
    viewAll,
  ])
}