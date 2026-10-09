/** 页面语言。 */
export type Lang = 'zh' | 'en'

/** 主题偏好：浅色 / 深色 / 跟随系统。 */
export type ThemePref = 'light' | 'dark' | 'system'

/** 一条中英双语文案。 */
export interface LocalizedText {
  zh: string
  en: string
}

/** GitHub API 仓库快照中被用到的字段（见 src/data/repos.snapshot.json）。 */
export interface RepoSnapshot {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  fork: boolean
  archived: boolean
  created_at: string
  pushed_at: string
}

/** 页面上展示的项目卡片数据。 */
export interface Project {
  name: string
  description: LocalizedText
  url: string
  homepage: string | null
  language: string | null
  stars: number
  updated: string
  archived: boolean
  /** 仓库没有描述，描述文案需要用户补写。 */
  needsDescription: boolean
}

/** 联系方式条目。value 为空表示尚未填写。 */
export interface ContactLink {
  id: 'github' | 'email' | 'qq' | 'bilibili'
  labelKey: string
  /** 仅 github 有确定值；其余留空并标记 todo。 */
  value: string
  href: string
  todo: boolean
}