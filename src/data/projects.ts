import snapshot from './repos.snapshot.json'
import type { Lang, Project, RepoSnapshot } from '../types'
import { profile } from './profile'
import { curatedDescriptions, hiddenRepos, projectOrder } from './curated'

/**
 * 数据来源：GitHub REST API 的公开仓库快照（已剔除 private 仓库）。
 * 后台可以「一键刷新」把它换成新的快照（存进 KV 覆盖层），刷新方式见 README。
 */
let repos = snapshot as RepoSnapshot[]

/** 构建时的快照（后台清空覆盖时回退到这里）。 */
export const builtinRepos: RepoSnapshot[] = snapshot as RepoSnapshot[]

/** 站点自身所在的仓库不放进项目卡片（页脚已有源码链接）。 */
const siteRepo = (): string => `${profile.login}.github.io`

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
  // 手写描述优先；没有就回落到 GitHub 上的仓库简述（中英同一份原文）
  const curated = curatedDescriptions[repo.name]
  const fallback = repo.description ?? ''
  return {
    name: repo.name,
    description: curated ?? { zh: fallback, en: fallback },
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    stars: repo.stargazers_count,
    updated: repo.pushed_at,
    archived: repo.archived,
    needsDescription: !curated && !fallback,
  }
}

/**
 * 本人仓库（会被 recomputeProjects 原地改写，所以数组引用保持稳定，导入方能看到更新）。
 * 排除：Fork 的仓库、站点自身所在仓库、以及声明为占位空仓库的仓库。
 */
export const ownProjects: Project[] = []

/** 公开仓库总数（与 GitHub 个人页数字一致）。用 let 导出，导入方拿的是实时值。 */
export let publicRepoCount = repos.length

/** 后台刷新快照后替换数据源。 */
export function applyRepoOverride(list: RepoSnapshot[]): void {
  repos = list
}

/** 某个仓库在 GitHub 上的原始简述（后台表单拿它当 placeholder）。 */
export function githubDescriptionOf(name: string): string {
  return repos.find((repo) => repo.name === name)?.description ?? ''
}

/** 重新计算项目列表；默认值、覆盖、顺序任一变化后都要调用一次。 */
export function recomputeProjects(): void {
  const projects = repos
    .filter(
      (repo) => !repo.fork && repo.name !== siteRepo() && !hiddenRepos.includes(repo.name),
    )
    .map(toProject)

  // 自定义顺序：列在前面的先显示，没列到的保持原顺序排在后面
  if (projectOrder.length > 0) {
    const rank = new Map(projectOrder.map((name, index) => [name, index]))
    projects.sort(
      (a, b) =>
        (rank.get(a.name) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.name) ?? Number.MAX_SAFE_INTEGER),
    )
  }

  ownProjects.length = 0
  ownProjects.push(...projects)
  publicRepoCount = repos.length
}

recomputeProjects()