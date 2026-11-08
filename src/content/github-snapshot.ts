import type { RepoSnapshot } from '../types.ts'

/**
 * GitHub 仓库列表 → 站点用的快照形态。
 *
 * 抽成纯函数是因为有两个来源：Worker 直连抓（带 token），
 * 或者浏览器直连公开 API 抓到后交给后端（不需要 token，也不依赖 Worker 的出口）。
 * 两者都过同一份整形，落库形状才一致。
 */
export function shapeRepos(raw: unknown): RepoSnapshot[] {
  if (!Array.isArray(raw)) return []

  const shaped: RepoSnapshot[] = (raw as Array<Record<string, unknown>>)
    .filter((repo) => Boolean(repo) && typeof repo === 'object' && repo.private !== true)
    .map((repo) => ({
      name: String(repo.name ?? ''),
      description: typeof repo.description === 'string' ? repo.description : null,
      html_url: String(repo.html_url ?? ''),
      homepage: typeof repo.homepage === 'string' && repo.homepage ? repo.homepage : null,
      language: typeof repo.language === 'string' ? repo.language : null,
      stargazers_count: Number(repo.stargazers_count ?? 0),
      fork: repo.fork === true,
      archived: repo.archived === true,
      created_at: String(repo.created_at ?? ''),
      pushed_at: String(repo.pushed_at ?? ''),
    }))
    .filter((repo) => repo.name && repo.html_url.startsWith('http'))

  shaped.sort((a, b) => {
    if (a.fork !== b.fork) return a.fork ? 1 : -1
    if (a.stargazers_count !== b.stargazers_count) return b.stargazers_count - a.stargazers_count
    return b.pushed_at.localeCompare(a.pushed_at)
  })

  return shaped
}

/**
 * 服务端直连抓取（需要 GITHUB_TOKEN）。
 *
 * 这条路径依赖 Cloudflare Workers 到 api.github.com 的出口；实测偶尔会失败
 * （边缘到 GitHub 的 TLS 握手 525），所以前端优先用浏览器直连，失败才回退到这里。
 */
export async function fetchPublicRepos(token: string): Promise<RepoSnapshot[]> {
  const response = await fetch(
    'https://api.github.com/user/repos?per_page=100&visibility=public&affiliation=owner&sort=pushed',
    {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'zenithliteaura-site-admin',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`)
  }

  return shapeRepos(await response.json())
}