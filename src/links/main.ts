import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/motion.css'
import './links.css'

import { builtinLinks, mergeLinks } from '../data/links'
import type { LinkContent, LinkItem, LinkLayout } from '../data/links'
import { h } from '../dom'
import { dict } from '../i18n'
import { renderTopBar, syncAppBarScroll } from '../sections/appbar'
import { applyTheme, state, subscribe } from '../store'

const appRoot = document.getElementById('app')
if (!appRoot) throw new Error('缺少 #app 容器')
const root: HTMLElement = appRoot

let content: LinkContent = builtinLinks

const isExternal = (href: string): boolean => /^https?:\/\//.test(href)

/** 外链新开标签且带 noopener；站内地址保持同页跳转 */
function linkAttrs(href: string): Record<string, string> {
  return isExternal(href)
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href }
}

function renderList(items: LinkItem[]): HTMLElement {
  return h(
    'nav',
    { class: 'lk-list', 'aria-label': 'links' },
    items.map((item) =>
      h('a', { class: 'lk-row', ...linkAttrs(item.href) }, [
        h('span', { class: 'lk-row__label', text: item.label }),
        ...(item.desc ? [h('span', { class: 'lk-row__desc mono', text: item.desc })] : []),
        h('span', { class: 'lk-row__arrow', 'aria-hidden': 'true', text: '→' }),
      ]),
    ),
  )
}

function renderGrid(items: LinkItem[]): HTMLElement {
  return h(
    'nav',
    { class: 'lk-grid', 'aria-label': 'links' },
    items.map((item) =>
      h('a', { class: 'lk-card', ...linkAttrs(item.href) }, [
        h('span', { class: 'lk-card__label', text: item.label }),
        ...(item.desc ? [h('span', { class: 'lk-card__desc mono', text: item.desc })] : []),
        h('span', { class: 'lk-card__arrow', 'aria-hidden': 'true', text: '↗' }),
      ]),
    ),
  )
}

function renderIndex(items: LinkItem[]): HTMLElement {
  return h(
    'nav',
    { class: 'lk-index', 'aria-label': 'links' },
    items.map((item, index) =>
      h('a', { class: 'lk-item', ...linkAttrs(item.href) }, [
        h('span', { class: 'lk-idx mono', text: String(index + 1).padStart(2, '0') }),
        h('span', { class: 'lk-item__label', text: item.label }),
        h('span', { class: 'lk-rule', 'aria-hidden': 'true' }),
        ...(item.desc ? [h('span', { class: 'lk-item__desc mono', text: item.desc })] : []),
      ]),
    ),
  )
}

function renderInline(items: LinkItem[]): HTMLElement {
  return h(
    'nav',
    { class: 'lk-inline', 'aria-label': 'links' },
    items.map((item) =>
      h('a', { class: 'lk-chip mono', ...linkAttrs(item.href) }, [h('span', { text: item.label })]),
    ),
  )
}

function paint(layout: LinkLayout, items: LinkItem[]): HTMLElement {
  if (layout === 'grid') return renderGrid(items)
  if (layout === 'list') return renderList(items)
  if (layout === 'inline') return renderInline(items)
  return renderIndex(items)
}

function render(): void {
  const d = dict(state.lang)
  document.title = d['links.metaTitle']
  document.querySelector('meta[name="description"]')?.setAttribute('content', d['links.lede'])

  const page = h('div', { class: 'page links-page' }, [
    h('p', { class: 'lk-overline mono', text: d['links.overline'] }),
    content.items.length
      ? paint(content.layout, content.items)
      : h('p', { class: 'lk-empty mono', text: d['links.empty'] }),
    h('footer', { class: 'lk-footer mono' }, [
      h('a', { class: 'lk-back', href: '/', text: '← ' + d['links.back'] }),
    ]),
  ])

  root.replaceChildren(renderTopBar(d['links.title'], '', '/'), page)
  syncAppBarScroll()
}

async function load(): Promise<void> {
  try {
    const response = await fetch('/content.json?t=' + Date.now(), { cache: 'no-store' })
    if (response.ok) {
      const body = (await response.json()) as { links?: unknown }
      content = mergeLinks(body?.links)
    }
  } catch {
    // 拿不到就用手上的默认值，页面不能因此空掉
  }
  render()
}

document.body.classList.add('links-shell')
applyTheme()
document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en'
subscribe(render)
window.addEventListener('scroll', syncAppBarScroll, { passive: true })

void load()
