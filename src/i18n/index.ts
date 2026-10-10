import { en } from './en'
import { zh } from './zh'
import type { Dict, DictKey } from './types'
import type { Lang } from '../types'

const dictionaries: Record<Lang, Dict> = { zh, en }

/**
 * KV 里的文案覆盖。只存被改过的键，未覆盖的键继续用构建时的默认值
 * ——这样以后改默认文案时，没被覆盖的键仍然会跟着更新。
 */
let overrides: Partial<Record<Lang, Partial<Dict>>> = {}
const merged: Partial<Record<Lang, Dict>> = {}

export function applyI18nOverrides(next: Partial<Record<Lang, Record<string, string>>>): void {
  overrides = {}
  for (const lang of ['zh', 'en'] as const) {
    const table = next?.[lang]
    if (!table) continue
    const cleaned: Partial<Dict> = {}
    for (const [key, value] of Object.entries(table)) {
      if (key in dictionaries[lang] && typeof value === 'string') {
        cleaned[key as DictKey] = value
      }
    }
    if (Object.keys(cleaned).length > 0) overrides[lang] = cleaned
  }
  delete merged.zh
  delete merged.en
}

export function dict(lang: Lang): Dict {
  const override = overrides[lang]
  if (!override) return dictionaries[lang]
  return (merged[lang] ??= { ...dictionaries[lang], ...override })
}

/** 取文案，并可选地替换 `{name}` 占位符。 */
export function t(lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  let text: string = dict(lang)[key]
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value))
    }
  }
  return text
}

export type { DictKey }