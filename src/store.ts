import type { Lang, ThemePref } from './types'

const LANG_KEY = 'zla:lang'
const THEME_KEY = 'zla:theme'

type Listener = () => void
const listeners = new Set<Listener>()

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null // 隐私模式 / 禁用存储
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* 忽略：偏好只是增强，不写入也能用 */
  }
}

function detectLang(): Lang {
  const saved = readStorage(LANG_KEY)
  if (saved === 'zh' || saved === 'en') return saved
  const nav = navigator.language || 'zh'
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function detectTheme(): ThemePref {
  const saved = readStorage(THEME_KEY)
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
}

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export const state: { lang: Lang; theme: ThemePref } = {
  lang: detectLang(),
  theme: detectTheme(),
}

/** 当前偏好下是否应走深色。 */
export function resolveDark(pref: ThemePref): boolean {
  return pref === 'dark' || (pref === 'system' && darkQuery.matches)
}

/** 把主题写到 <html data-theme>，配色全部由 CSS 令牌接管。 */
export function applyTheme(): void {
  document.documentElement.dataset.theme = resolveDark(state.theme) ? 'dark' : 'light'
}

export function setLang(lang: Lang): void {
  if (state.lang === lang) return
  state.lang = lang
  writeStorage(LANG_KEY, lang)
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  emit()
}

export function setTheme(pref: ThemePref): void {
  if (state.theme === pref) return
  state.theme = pref
  writeStorage(THEME_KEY, pref)
  applyTheme()
  emit()
}

export function subscribe(listener: Listener): void {
  listeners.add(listener)
}

function emit(): void {
  for (const listener of listeners) listener()
}

// 系统主题变化时，仅在「跟随系统」模式下跟着刷新。
darkQuery.addEventListener('change', () => {
  if (state.theme !== 'system') return
  applyTheme()
  emit()
})