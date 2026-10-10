/**
 * 内容覆盖层的路径与类型（前后端共用，不含服务端依赖）。
 *
 * 设计：构建产物里始终带着一份「默认值」，KV 里只存**覆盖**。
 * 公开页启动时拉一次 /content.json，拿到就合并覆盖；拿不到（例如 GitHub Pages 没有后端）
 * 就静默使用默认值。所以两个域名都不会因为后端缺失而变成空白。
 */

export type ContentSection = 'profile' | 'projects' | 'repos' | 'i18n'

export const CONTENT_SECTIONS: readonly ContentSection[] = ['profile', 'projects', 'repos', 'i18n']

/** 公开读取路径（无需登录，内容是公开站点内容）。 */
export const PUBLIC_CONTENT_PATH = '/content.json'

export const contentKey = (section: ContentSection): string => `content:${section}`

export const isPublicContentPath = (pathname: string): boolean => pathname === PUBLIC_CONTENT_PATH

export const isContentSection = (value: unknown): value is ContentSection =>
  typeof value === 'string' && (CONTENT_SECTIONS as readonly string[]).includes(value)

/** KV 里存的结构：数据 + 写入时间，便于后台显示。 */
export interface StoredSection<T = unknown> {
  updatedAt: string
  data: T
}

export interface ContentBundle {
  updatedAt: string | null
  profile?: unknown
  projects?: unknown
  repos?: unknown
  i18n?: unknown
}