import { contactEntries, profile } from '../data/profile'
import { h } from '../dom'
import { dict } from '../i18n'
import type { DictKey } from '../i18n'
import { state } from '../store'
import { externalIcon, todoBadge } from './shared'

export function renderContact(): HTMLElement {
  const d = dict(state.lang)
  const card = h('div', { class: 'card' })

  for (const contact of contactEntries()) {
    const label = d[contact.labelKey as DictKey]

    if (contact.value && contact.href) {
      // 只有 http(s) 链接才是新窗口外链；mailto 之类的就地打开，不加箭头图标
      const isExternal = contact.href.startsWith('http')
      const content: (Node | string)[] = [
        h('span', { class: 'row__text' }, [
          h('span', { class: 'row__t', text: label }),
          h('span', { class: 'row__s', text: contact.value }),
        ]),
      ]
      if (isExternal) content.push(externalIcon())

      card.append(
        h(
          'a',
          isExternal
            ? {
                class: 'row',
                href: contact.href,
                target: '_blank',
                rel: 'noopener noreferrer',
              }
            : { class: 'row', href: contact.href },
          content,
        ),
      )
      continue
    }

    // 未填写：只有在开启 TODO 标记时才占位，避免上线后出现空行
    const badge = todoBadge()
    if (!badge) continue
    card.append(h('div', { class: 'row row--todo' }, [
      h('span', { class: 'row__text' }, [
        h('span', { class: 'row__t', text: label }),
        h('span', { class: 'row__s' }, [
          h('span', { text: d['contact.pending'] }),
          badge,
        ]),
      ]),
    ]))
  }

  return h('section', { class: 'section' }, [
    h('h2', { class: 'group-title', text: d['section.contact'] }),
    card,
  ])
}

export function renderFooter(): HTMLElement {
  const d = dict(state.lang)
  return h('footer', { class: 'footer' }, [
    h('div', { text: `${d['footer.built']} · ${d['footer.langNote']}` }),
    h('div', {}, [
      h('a', {
        href: `${profile.github}/ZenithLiteAura.github.io`,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: d['footer.source'],
      }),
      document.createTextNode(
        ` · © ${new Date().getFullYear()} ${profile.login}`,
      ),
    ]),
  ])
}