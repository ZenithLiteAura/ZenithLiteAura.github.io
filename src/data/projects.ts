import snapshot from './repos.snapshot.json'
import type { Lang, Project, RepoSnapshot } from '../types'
import { profile } from './profile'

/**
 * 数据来源：GitHub REST API 的公开仓库快照（已剔除 private 仓库）。
 * 刷新方式见 README「刷新 GitHub 数据」一节。
 */
const repos = snapshot as RepoSnapshot[]

/** 站点自身所在的仓库不放进项目卡片（页脚已有源码链接）。 */
const SITE_REPO = `${profile.login}.github.io`

/** 语言色点，沿用 GitHub 的配色习惯。 */
const LANGUAGE_COLORS: Record<string, string> = {
  Dart: '#00B4AB',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  'C#': '#178600',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Vue: '#41b883',
  Shell: '#89e051',
  'C++': '#f34b7d',
  C: '#555555',
  Rust: '#dea584',
  Swift: '#F05138',
  Go: '#00ADD8',
}

export function languageColor(language: string | null): string {
  return (language && LANGUAGE_COLORS[language]) || 'var(--text-3)'
}

/** ISO 时间 →「2025年8月」/「Aug 2025」。 */
export function formatMonth(iso: string, lang: Lang): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 7)
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date)
}

function toProject(repo: RepoSnapshot): Project {
  return {
    name: repo.name,
    // TODO(user)：描述直接取自 GitHub；英文文案仍需你补，这里暂时回落到原文。
    description: { zh: repo.description ?? '', en: repo.description ?? '' },
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    stars: repo.stargazers_count,
    updated: repo.pushed_at,
    archived: repo.archived,
    needsDescription: !repo.description,
  }
}

/** 本人仓库（不含站点自身），已按星标与更新时间排序。 */
export const ownProjects: Project[] = repos
  .filter((repo) => !repo.fork && repo.name !== SITE_REPO)
  .map(toProject)

/** Fork 的仓库，用标签云展示。 */
export const forkedRepos = repos
  .filter((repo) => repo.fork)
  .map((repo) => ({
    name: repo.name,
    url: repo.html_url,
    language: repo.language,
  }))

/** 公开仓库总数（与 GitHub 个人页数字一致）。 */
export const publicRepoCount = repos.length