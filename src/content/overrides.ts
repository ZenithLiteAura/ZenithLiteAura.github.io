import { applyProjectsOverride } from '../data/curated'
import { applyProfileOverride } from '../data/profile'
import { applyRepoOverride, builtinRepos, recomputeProjects } from '../data/projects'
import { applyI18nOverrides } from '../i18n'
import type { RepoSnapshot } from '../types'
import { PUBLIC_CONTENT_PATH } from './content-shared'

/** KV 里的内容覆盖（结构由服务端校验，见 src/content/content-api.ts）。 */
export interface ContentBundle {
  updatedAt: string | null
  profile?: Parameters<typeof applyProfileOverride>[0]
  projects?: Parameters<typeof applyProjectsOverride>[0]
  repos?: RepoSnapshot[]
  i18n?: Partial<Record<'zh' | 'en', Record<string, string>>>
}

let bundle: ContentBundle | null = null

function applyBundle(data: ContentBundle): void {
  // 顺序要紧：仓库数据 → 手写描述与顺序 → 个人资料，最后统一重算项目列表
  // 每一层都是「先重置回默认值再套覆盖」，所以后台清空覆盖后这里能真正复原
  applyRepoOverride(Array.isArray(data.repos) && data.repos.length > 0 ? data.repos : builtinRepos)
  applyProjectsOverride(data.projects ?? {})
  applyProfileOverride(data.profile ?? {})
  applyI18nOverrides(data.i18n ?? {})
  recomputeProjects()
}

/**
 * 启动时拉一次内容覆盖。
 *
 * 拿到就合并进各数据模块；拿不到（超时、网络失败、或 GitHub Pages 这种没有后端的环境）
 * 就静默使用构建时的默认值——所以两个域名都不会因为后端缺失而变成空白。
 */
export async function loadContentOverrides(timeoutMs = 1200): Promise<void> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(PUBLIC_CONTENT_PATH, {
      signal: controller.signal,
      cache: 'no-cache',
    })
    clearTimeout(timer)
    if (!response.ok) return

    const data = (await response.json()) as ContentBundle
    applyBundle(data)
    bundle = data
  } catch {
    /* 用默认值 */
  }
}

/** 当前生效的覆盖（后台用它预填表单）。 */
export const currentBundle = (): ContentBundle | null => bundle