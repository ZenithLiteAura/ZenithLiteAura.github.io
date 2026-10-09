import type { zh } from './zh'

/**
 * 以中文字典的键为准，强制英文字典一一对应；
 * 少写或写错键名都会在 `npm run typecheck` 阶段直接报错。
 */
export type DictKey = keyof typeof zh
export type Dict = { [K in DictKey]: string }