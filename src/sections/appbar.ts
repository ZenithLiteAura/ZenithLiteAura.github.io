import { profile } from '../data/profile'
import { ICON, h } from '../dom'
import { dict } from '../i18n'
import { segmented } from './shared'
import { setLang, setTheme, state } from '../store'
import type { Lang, ThemePref } from '../types'

const LANGS: Lang[] = ['zh', 'en']
const LANG_LABELS: Record<Lang, string> = { zh: '中', en: 'EN' }
const THEMES: ThemePref[] = ['light', 'dark', 'system']
const THEME_ICONS: Record<ThemePref, string> = {
  light: ICON.sun,
  dark: ICON.moon,
  system: ICON.auto,
}

export function renderAppBar(): HTMLElement {
  const d = dict(state.lang)

  const langSwitch = segmented({
    ariaLabel: d['a11y.lang'],
    options: LANGS.map((lang) => ({
      key: lang,
      label: LANG_LABELS[lang],
      title: lang === 'zh' ? '中文' : 'English',
    })),
    activeIndex: LANGS.indexOf(state.lang),
    onSelect: (index) => {
      const lang = LANGS[index]
      if (lang) setLang(lang)
    },
  })

  const themeSwitch = segmented({
    ariaLabel: d['a11y.theme'],
    variant: 'icon',
    options: THEMES.map((pref) => ({
      key: pref,
      icon: THEME_ICONS[pref],
      title: d[`theme.${pref}`],
    })),
    activeIndex: THEMES.indexOf(state.theme),
    onSelect: (index) => {
      const pref = THEMES[index]
      if (pref) setTheme(pref)
    },
  })

  return h('header', { class: 'appbar', id: 'appbar' }, [
    h('div', { class: 'appbar__inner' }, [
      h('div', { class: 'appbar__title' }, [
        h('span', { class: 'appbar__name', text: profile.login }),
        h('span', { class: 'appbar__sub', text: profile.headline[state.lang] }),
      ]),
      h('div', { class: 'appbar__actions' }, [langSwitch, themeSwitch]),
    ]),
  ])
}