import { zh } from '../i18n/zh.ts'
import { en } from '../i18n/en.ts'
import { jsonResponse } from '../verify/cap-api.ts'
import type { KvStore, ServerEnv } from '../server-shared.ts'
import { contentKey, CONTENT_SECTIONS, isContentSection } from './content-shared.ts'
import type { ContentBundle, ContentSection, StoredSection } from './content-shared.ts'
import { fetchPublicRepos } from './github-snapshot.ts'

/**
 * 内容覆盖接口。
 *
 * - `GET /content.json`（公开）：把 KV 里的覆盖打包返回。内容是公开站点内容，不需要登录。
 * - `GET/PUT/DELETE /admin/api/content`（需要会话）：读原始覆盖 / 写某个区块 / 清空某个区块。
 * - `POST /admin/api/github/snapshot`（需要会话）：重新抓 GitHub 公开仓库快照。
 *
 * 写入一律先过校验：后台能写什么必须限形态，否则一条脏数据就能把公开页搞坏。
 */

const MAX_TEXT = 2000
const MAX_NAME = 120

type Valid<T> = { ok: true; data: T } | { ok: false; error: string }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** 取一个非空字符串（超长截断）；空串/非字符串返回 undefined，表示「不改这一项」。 */
function optionalText(value: unknown, max = MAX_TEXT): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : undefined
}

function localized(input: unknown): { zh: string; en: string } | undefined {
  if (!isPlainObject(input)) return undefined
  const zhText = optionalText(input.zh)
  const enText = optionalText(input.en)
  if (!zhText && !enText) return undefined
  return { zh: zhText ?? '', en: enText ?? '' }
}

function nameList(input: unknown, max = 300): string[] | undefined {
  if (!Array.isArray(input)) return undefined
  const names = input
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, MAX_NAME))
    .filter(Boolean)
  return names.slice(0, max)
}

/* ------------------------------ 各区块校验 ------------------------------ */

function validateProfile(input: unknown): Valid<Record<string, unknown>> {
  if (!isPlainObject(input)) return { ok: false, error: 'profile 必须是对象' }
  const data: Record<string, unknown> = {}

  const login = optionalText(input.login, 60)
  if (login) data.login = login

  const headline = localized(input.headline)
  if (headline) data.headline = headline

  const bio = localized(input.bio)
  if (bio) data.bio = bio

  const skills = nameList(input.skills, 30)
  if (skills) data.skills = skills.map((skill) => skill.slice(0, 40))

  const email = optionalText(input.email, 160)
  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: '邮箱格式不对' }
    data.email = email
  }

  const github = optionalText(input.github, 300)
  if (github) {
    if (!github.startsWith('http')) return { ok: false, error: 'GitHub 链接必须以 http 开头' }
    data.github = github
  }

  return { ok: true, data }
}

function validateProjects(input: unknown): Valid<Record<string, unknown>> {
  if (!isPlainObject(input)) return { ok: false, error: 'projects 必须是对象' }
  const data: Record<string, unknown> = {}

  if (input.descriptions !== undefined) {
    if (!isPlainObject(input.descriptions)) return { ok: false, error: 'descriptions 必须是对象' }
    const descriptions: Record<string, { zh: string; en: string }> = {}
    for (const [name, value] of Object.entries(input.descriptions)) {
      const text = localized(value)
      if (!text) continue
      descriptions[name.slice(0, MAX_NAME)] = text
      if (Object.keys(descriptions).length >= 200) break
    }
    data.descriptions = descriptions
  }

  const order = nameList(input.order, 200)
  if (order) data.order = order

  const hidden = nameList(input.hidden, 200)
  if (hidden) data.hidden = hidden

  return { ok: true, data }
}

function validateRepos(input: unknown): Valid<Record<string, unknown>[]> {
  if (!Array.isArray(input)) return { ok: false, error: 'repos 必须是数组' }
  const data: Record<string, unknown>[] = []
  for (const item of input.slice(0, 300)) {
    if (!isPlainObject(item)) continue
    const name = optionalText(item.name, MAX_NAME)
    const url = optionalText(item.html_url, 500)
    if (!name || !url || !url.startsWith('http')) continue
    data.push({
      name,
      description: optionalText(item.description, MAX_TEXT) ?? null,
      html_url: url,
      homepage: optionalText(item.homepage, 500) ?? null,
      language: optionalText(item.language, 40) ?? null,
      stargazers_count: Number.isFinite(Number(item.stargazers_count)) ? Number(item.stargazers_count) : 0,
      fork: item.fork === true,
      archived: item.archived === true,
      created_at: optionalText(item.created_at, 40) ?? '',
      pushed_at: optionalText(item.pushed_at, 40) ?? '',
    })
  }
  if (data.length === 0) return { ok: false, error: 'repos 里没有有效条目' }
  return { ok: true, data }
}

function validateI18n(input: unknown): Valid<Record<string, unknown>> {
  if (!isPlainObject(input)) return { ok: false, error: 'i18n 必须是对象' }
  const known = new Set(Object.keys(zh))
  const data: Record<string, Record<string, string>> = {}

  for (const lang of ['zh', 'en'] as const) {
    const table = input[lang]
    if (table === undefined) continue
    if (!isPlainObject(table)) return { ok: false, error: `i18n.${lang} 必须是对象` }
    const cleaned: Record<string, string> = {}
    for (const [key, value] of Object.entries(table)) {
      if (!known.has(key)) return { ok: false, error: `i18n.${lang} 里有未知键：${key}` }
      const text = optionalText(value)
      if (text === undefined) continue
      cleaned[key] = text
    }
    data[lang] = cleaned
  }

  return { ok: true, data }
}

function validateSection(section: ContentSection, input: unknown): Valid<unknown> {
  switch (section) {
    case 'profile':
      return validateProfile(input)
    case 'projects':
      return validateProjects(input)
    case 'repos':
      return validateRepos(input)
    case 'i18n':
      return validateI18n(input)
  }
}

/* ------------------------------ KV 读写 ------------------------------ */

async function readSection(kv: KvStore, section: ContentSection): Promise<StoredSection | null> {
  const raw = await kv.get(contentKey(section))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredSection
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

async function readAll(kv: KvStore): Promise<ContentBundle> {
  const bundle: ContentBundle = { updatedAt: null }
  let newest = 0
  for (const section of CONTENT_SECTIONS) {
    const stored = await readSection(kv, section)
    if (!stored) continue
    bundle[section] = stored.data
    const at = Date.parse(stored.updatedAt)
    if (Number.isFinite(at) && at > newest) newest = at
  }
  bundle.updatedAt = newest ? new Date(newest).toISOString() : null
  return bundle
}

/* ------------------------------ 路由处理 ------------------------------ */

/** 公开读取：浏览器启动时拉这个。短缓存，改完大约半分钟内生效。 */
export async function handlePublicContent(env: ServerEnv): Promise<Response> {
  const cache = { 'cache-control': 'public, max-age=30' }
  if (!env.ADMIN_KV) return jsonResponse({ updatedAt: null }, 200, cache)
  return jsonResponse(await readAll(env.ADMIN_KV), 200, cache)
}

/** 后台读原始覆盖 / 写区块 / 清空区块。调用方已确认是有效会话。 */
export async function handleAdminContent(request: Request, env: ServerEnv): Promise<Response> {
  const kv = env.ADMIN_KV as KvStore
  const method = request.method

  if (method === 'GET') {
    const sections: Record<string, StoredSection | null> = {}
    for (const section of CONTENT_SECTIONS) {
      sections[section] = await readSection(kv, section)
    }
    return jsonResponse({ sections })
  }

  if (method === 'DELETE') {
    const section = new URL(request.url).searchParams.get('section')
    if (!isContentSection(section)) return jsonResponse({ error: 'unknown_section' }, 400)
    await kv.delete(contentKey(section))
    return jsonResponse({ ok: true, section, cleared: true })
  }

  if (method === 'PUT') {
    const body = (await request.json().catch(() => null)) as { section?: unknown; data?: unknown } | null
    if (!body || !isContentSection(body.section)) return jsonResponse({ error: 'unknown_section' }, 400)
    const result = validateSection(body.section, body.data)
    if (!result.ok) return jsonResponse({ error: 'invalid_content', message: result.error }, 400)

    const stored: StoredSection = { updatedAt: new Date().toISOString(), data: result.data }
    await kv.put(contentKey(body.section), JSON.stringify(stored))
    return jsonResponse({ ok: true, section: body.section, updatedAt: stored.updatedAt })
  }

  return jsonResponse({ error: 'method_not_allowed' }, 405)
}

/** 重新抓 GitHub 公开仓库快照并写入覆盖。 */
export async function handleSnapshotRefresh(env: ServerEnv): Promise<Response> {
  const token = env.GITHUB_TOKEN
  if (!token) {
    return jsonResponse(
      { error: 'server_not_configured', missing: ['GITHUB_TOKEN'], message: '缺少 GITHUB_TOKEN' },
      503,
    )
  }
  const kv = env.ADMIN_KV as KvStore

  try {
    const repos = await fetchPublicRepos(token)
    const result = validateRepos(repos)
    if (!result.ok) return jsonResponse({ error: 'invalid_content', message: result.error }, 400)

    const stored: StoredSection = { updatedAt: new Date().toISOString(), data: result.data }
    await kv.put(contentKey('repos'), JSON.stringify(stored))
    return jsonResponse({ ok: true, count: result.data.length, updatedAt: stored.updatedAt })
  } catch (error) {
    return jsonResponse(
      { error: 'github_failed', message: error instanceof Error ? error.message : String(error) },
      502,
    )
  }
}

export { en as enDictionary, zh as zhDictionary }