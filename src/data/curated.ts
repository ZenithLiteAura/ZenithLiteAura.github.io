import type { LocalizedText } from '../types'

/** 后台可以覆盖的项目设置；留空表示沿用默认值。 */
export interface ProjectsOverride {
  /** 手写项目介绍，键名 = 仓库名 */
  descriptions?: Record<string, LocalizedText>
  /** 自定义显示顺序（仓库名，排在前面的先显示） */
  order?: string[]
  /** 不上首页的仓库 */
  hidden?: string[]
}

const BUILTIN_DESCRIPTIONS: Record<string, LocalizedText> = {
  Pho_Community: {
    zh: '无服务端的照片浏览与同步应用。照片按日期直接存放在你自己的 SMB / WebDAV / NFS 存储上，不建数据库、不需要账号。',
    en: 'A serverless photo browsing and sync app. Photos sit on your own SMB / WebDAV / NFS storage, organised by date. No database, no account.',
  },
}

/**
 * cuddly-guide：建仓库时自动生成的空占位，里面只有一个 LICENSE 和 14 字节的 README，
 * 没有任何内容，所以不放进首页的项目卡片。
 */
const BUILTIN_HIDDEN = ['cuddly-guide']

/** 手写项目描述（会被 KV 覆盖改写）。页面优先用它，没有条目就回落到 GitHub 的仓库简述。 */
export const curatedDescriptions: Record<string, LocalizedText> = { ...BUILTIN_DESCRIPTIONS }

/** 不上个人主页的仓库（会被 KV 覆盖改写）。 */
export const hiddenRepos: string[] = [...BUILTIN_HIDDEN]

/** 自定义显示顺序（会被 KV 覆盖改写）。 */
export const projectOrder: string[] = []

/** 默认值快照：后台表单用它当 placeholder。 */
export const builtinCurated = {
  descriptions: BUILTIN_DESCRIPTIONS,
  hidden: BUILTIN_HIDDEN,
  order: [] as string[],
}

/** 套用覆盖（同样先重置回默认值，保证幂等、可清空）。 */
export function applyProjectsOverride(override: ProjectsOverride): void {
  for (const key of Object.keys(curatedDescriptions)) delete curatedDescriptions[key]
  Object.assign(curatedDescriptions, { ...BUILTIN_DESCRIPTIONS })
  if (override.descriptions) Object.assign(curatedDescriptions, override.descriptions)

  hiddenRepos.length = 0
  hiddenRepos.push(...(override.hidden ?? BUILTIN_HIDDEN))

  projectOrder.length = 0
  projectOrder.push(...(override.order ?? []))
}