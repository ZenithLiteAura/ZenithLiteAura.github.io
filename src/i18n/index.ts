import { en } from './en'
import { zh } from './zh'
import type { Dict, DictKey } from './types'
import type { Lang } from '../types'

const dictionaries: Record<Lang, Dict> = { zh, en }

export function dict(lang: Lang): Dict {
  return dictionaries[lang]
}

/** 取文案，并可选地替换 `{name}` 占位符。 */
export function t(lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  let text: string = dictionaries[lang][key]
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value))
    }
  }
  return text
}

export type { DictKey }