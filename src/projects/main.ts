import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/motion.css'
import './project.css'

import { PROJECTS, projectBySlug } from '../data/project-pages'
import type { Bi, ProjectPage } from '../data/project-pages'
import { h } from '../dom'
import { dict } from '../i18n'
import { renderTopBar, syncAppBarScroll } from '../sections/appbar'
import { applyTheme, state, subscribe } from '../store'

const appRoot = document.getElementById('app')
if (!appRoot) throw new Error('缺少 #app 容器')
const root: HTMLElement = appRoot

const pick = (text: Bi): string => (state.lang === 'en' ? text.en : text.zh)

function slugFromPath(): string {
  const parts = location.pathname.replace(/\/+$/, '').split('/')
  return parts[parts.length - 1] ?? ''
}

function sectionHead(index: string, title: string): HTMLElement {
  return h('div', { class: 'p-sec__head' }, [
    h('span', { class: 'p-idx mono', text: index }),
    h('h2', { class: 'p-sec__title', text: title }),
    h('span', { class: 'p-rule' }),
  ])
}

function renderMeta(project: ProjectPage): HTMLElement {
  return h(
    'dl',
    { class: 'p-meta' },
    project.meta.map((row) =>
      h('div', { class: 'p-meta__row' }, [
        h('dt', { class: 'p-meta__k mono', text: pick(row.label) }),
        h('dd', { class: 'p-meta__v', text: pick(row.value) }),
      ]),
    ),
  )
}

function renderFeatures(project: ProjectPage): HTMLElement {
  return h(
    'div',
    { class: 'p-features' },
    project.features.map((feature, index) =>
      h('article', { class: 'p-feature' }, [
        h('span', { class: 'p-feature__idx mono', text: String(index + 1).padStart(2, '0') }),
        h('h3', { class: 'p-feature__title', text: pick(feature.title) }),
        h('p', { class: 'p-feature__body', text: pick(feature.body) }),
      ]),
    ),
  )
}

function renderShots(project: ProjectPage): HTMLElement | null {
  if (!project.shots?.length) return null
  return h(
    'div',
    { class: 'p-shots' },
    project.shots.map((shot) =>
      h('figure', { class: 'p-shot' }, [
        h('img', { src: shot.src, alt: pick(shot.alt), loading: 'lazy', decoding: 'async' }),
        h('figcaption', { class: 'p-shot__cap mono', text: pick(shot.alt) }),
      ]),
    ),
  )
}

function renderStart(project: ProjectPage): HTMLElement | null {
  if (!project.start) return null
  return h('div', { class: 'p-start' }, [
    h('p', { class: 'p-start__note', text: pick(project.start.note) }),
    h('pre', { class: 'p-code mono' }, [h('code', { text: project.start.code.join('\n') })]),
  ])
}

function renderLinks(project: ProjectPage): HTMLElement {
  return h(
    'div',
    { class: 'p-links' },
    project.links.map((link, index) =>
      h('a', {
        class: index === 0 ? 'p-btn p-btn--primary mono' : 'p-btn mono',
        href: link.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: pick(link.label),
      }),
    ),
  )
}

function renderOthers(project: ProjectPage): HTMLElement {
  const others = PROJECTS.filter((item) => item.slug !== project.slug)
  return h(
    'div',
    { class: 'p-others' },
    others.map((item) =>
      h('a', { class: 'p-other', href: `/projects/${item.slug}/` }, [
        h('span', { class: 'p-other__name', text: item.name }),
        h('span', { class: 'p-other__tag mono', text: pick(item.tagline) }),
      ]),
    ),
  )
}

function render(): void {
  const d = dict(state.lang)
  const project = projectBySlug(slugFromPath())

  if (!project) {
    document.title = 'Projects · ZenithLiteAura'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', 'ZenithLiteAura projects')
    root.replaceChildren(
      renderTopBar('Projects', '', '/'),
      h('div', { class: 'page projects-page' }, [
        h('p', { class: 'p-overline mono', text: '~/projects' }),
        h('h1', { class: 'p-name', text: '404' }),
        h('p', { class: 'p-tagline', text: d['project.notFound'] }),
        h('a', { class: 'p-btn p-btn--primary mono', href: '/', text: d['project.back'] }),
      ]),
    )
    syncAppBarScroll()
    return
  }

  document.title = `${project.name} · ZenithLiteAura`
  document.querySelector('meta[name="description"]')?.setAttribute('content', pick(project.tagline))

  // 小节编号在页内从 01 递增，避免出现 03 后面跟 01
  let sectionNo = 0
  const nextIdx = (): string => String(++sectionNo).padStart(2, '0')

  const page = h('div', { class: 'page projects-page' }, [
    h('p', { class: 'p-overline mono', text: `~/projects/${project.slug}` }),
    h('h1', { class: 'p-name', text: project.name }),
    h('p', { class: 'p-tagline', text: pick(project.tagline) }),

    h('p', { class: 'p-summary', text: pick(project.summary) }),

    h('section', { class: 'p-sec' }, [
      sectionHead(nextIdx(), d['project.meta']),
      renderMeta(project),
    ]),

    h('section', { class: 'p-sec' }, [
      sectionHead(nextIdx(), d['project.features']),
      renderFeatures(project),
    ]),

    ...(project.shots?.length
      ? [h('section', { class: 'p-sec' }, [sectionHead(nextIdx(), d['project.shots']), renderShots(project)!])]
      : []),

    ...(project.start
      ? [h('section', { class: 'p-sec' }, [sectionHead(nextIdx(), d['project.start']), renderStart(project)!])]
      : []),

    h('section', { class: 'p-sec' }, [
      sectionHead(nextIdx(), d['project.links']),
      renderLinks(project),
      ...(project.attribution ? [h('p', { class: 'p-note mono', text: pick(project.attribution) })] : []),
    ]),

    h('section', { class: 'p-sec p-sec--others' }, [sectionHead(nextIdx(), d['project.others']), renderOthers(project)]),

    h('footer', { class: 'p-footer mono' }, [
      h('a', { class: 'p-back', href: '/', text: '← ' + d['project.back'] }),
    ]),
  ])

  root.replaceChildren(renderTopBar(project.name, '', '/'), page)
  syncAppBarScroll()
}

document.body.classList.add('projects-shell')
document.documentElement.classList.add('projects-page')
applyTheme()
document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en'

subscribe(render)
window.addEventListener('scroll', syncAppBarScroll, { passive: true })
render()
