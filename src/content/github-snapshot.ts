import type { RepoSnapshot } from '../types.ts'

/**
 * 拉取 GitHub 公开仓库快照。
 *
 * 与 README 里那段 PowerShell 生成脚本等价：只取公开仓库（**过滤 private**，
 * 避免把私有仓库名写到公开页面上），并裁到页面用得到的字段。
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

  const raw = (await response.json()) as Array<Record<string, unknown>>
  const trimmed: RepoSnapshot[] = raw
    .filter((repo) => repo.private !== true)
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

  trimmed.sort((a, b) => {
    if (a.fork !== b.fork) return a.fork ? 1 : -1
    if (a.stargazers_count !== b.stargazers_count) return b.stargazers_count - a.stargazers_count
    return b.pushed_at.localeCompare(a.pushed_at)
  })

  return trimmed
}