import { profile } from '../data/profile'
import { publicRepoCount } from '../data/projects'
import { formatMonth } from '../data/projects'
import { h } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'

export function renderHero(): HTMLElement {
  const d = dict(state.lang)
  // 英文里 1 要用单数
  const followerLabel =
    profile.followers === 1 ? d['hero.badge.follower'] : d['hero.badge.followers']

  return h('section', { class: 'section' }, [
    h('div', { class: 'card hero' }, [
      h('div', { class: 'hero__top' }, [
        h('img', {
          class: 'hero__avatar',
          src: profile.avatar,
          width: 72,
          height: 72,
          alt: profile.login,
          loading: 'eager',
          decoding: 'async',
        }),
        h('div', { class: 'hero__id' }, [
          h('h1', { class: 'hero__name', text: profile.login }),
          h('div', {
            class: 'hero__alias',
            text: `${d['hero.aliasPrefix']} ${profile.alias}`,
          }),
        ]),
      ]),
      h('div', { class: 'hero__badges' }, [
        h('span', { class: 'badge' }, [
          h('b', { text: String(publicRepoCount) }),
          document.createTextNode(d['hero.badge.repos']),
        ]),
        h('span', {
          class: 'badge',
          text: `${d['hero.badge.joined']} ${formatMonth(profile.joined, state.lang)}`,
        }),
        h('span', { class: 'badge' }, [
          h('b', { text: String(profile.followers) }),
          document.createTextNode(followerLabel),
        ]),
      ]),
    ]),
  ])
}