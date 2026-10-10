import { ADMIN_API_BASE } from './admin-shared'
import { builtinCurated } from '../data/curated'
import { builtinProfile } from '../data/profile'
import { githubDescriptionOf, ownProjects, publicRepoCount } from '../data/projects'
import { h } from '../dom'
import { dict } from '../i18n'
import { en } from '../i18n/en'
import { zh } from '../i18n/zh'
import { state } from '../store'
import { loadContentOverrides } from '../content/overrides'
import type { ContentSection, StoredSection } from '../content/content-shared'

/**
 * 真管理面板。
 *
 * 表单编辑的是**覆盖层**而不是最终内容：
 *  - 文本字段留空 = 沿用构建时的默认值（默认值显示为 placeholder）
 *  - 列表字段（顺序 / 隐藏）直接预填当前生效值——用 placeholder 表达列表的默认值太容易踩坑
 *    （例如填一个别的仓库名，会把默认隐藏的那个挤出来）
 */

type RawSections = Partial<Record<ContentSection, StoredSection | null>>

let raw: RawSections = {}
let loadedRaw = false

type Notify = (text: string, isError?: boolean) => void

/* ------------------------------- 小工具 ------------------------------- */

function field(label: string, input: HTMLElement): HTMLElement {
  return h('label', { class: 'admin-field' }, [
    h('span', { class: 'admin-label', text: label }),
    input,
  ])
}

function textInput(placeholder: string, value = ''): HTMLInputElement {
  return h('input', {
    type: 'text',
    class: 'admin-input',
    placeholder,
    value,
    spellcheck: 'false',
  })
}

function textArea(placeholder: string, value = ''): HTMLTextAreaElement {
  return h('textarea', { class: 'admin-input admin-textarea', rows: 3, placeholder, text: value })
}

const parseList = (value: string): string[] =>
  value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

const joinList = (items: string[]): string => items.join(', ')

function sectionCard(title: string, hint: string, body: HTMLElement, actions: HTMLElement[]): HTMLElement {
  return h('section', { class: 'admin-block' }, [
    h('h2', { class: 'admin-block__title', text: title }),
    h('p', { class: 'admin-hint', text: hint }),
    body,
    h('div', { class: 'admin-actions' }, actions),
  ])
}

function button(text: string, variant: 'primary' | 'ghost' = 'primary'): HTMLButtonElement {
  return h('button', { type: 'button', class: `btn btn--${variant} admin-btn`, text })
}

async function request(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const response = await fetch(path, init)
    const data = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, data }
  } catch {
    return { ok: false, status: 0, data: null }
  }
}

function describeError(d: ReturnType<typeof dict>, result: { status: number; data: unknown }): string {
  const body = result.data as { message?: string; missing?: string[]; error?: string } | null
  if (result.status === 401) return d['admin.expired']
  if (result.status === 503) {
    return d['admin.errorNotConfigured'].replace('{missing}', (body?.missing ?? []).join('、'))
  }
  return `${d['admin.saveFailed']}（${body?.message ?? body?.error ?? result.status}）`
}

/** 保存/清空成功后：重新拉覆盖 + 重绘面板，然后把提示写到面板顶部那条不会被重绘冲掉的横条上。 */
async function afterWrite(d: ReturnType<typeof dict>, notify: Notify): Promise<void> {
  await loadContentOverrides(3000)
  raw = await fetchRaw()
  rerender?.()
  notify(d['admin.saved'])
}

async function fetchRaw(): Promise<RawSections> {
  const result = await request(`${ADMIN_API_BASE}content`)
  if (!result.ok) return {}
  const body = result.data as { sections?: RawSections } | null
  return body?.sections ?? {}
}

/* ------------------------------- 个人资料 ------------------------------- */

function profileSection(d: ReturnType<typeof dict>, notify: Notify): HTMLElement {
  const current = (raw.profile?.data ?? {}) as Record<string, unknown>
  const currentHeadline = (current.headline ?? {}) as Record<string, string>
  const currentBio = (current.bio ?? {}) as Record<string, string>

  const login = textInput(builtinProfile.login, String(current.login ?? ''))
  const headlineZh = textInput(builtinProfile.headline.zh, currentHeadline.zh ?? '')
  const headlineEn = textInput(builtinProfile.headline.en, currentHeadline.en ?? '')
  const bioZh = textArea(builtinProfile.bio.zh, currentBio.zh ?? '')
  const bioEn = textArea(builtinProfile.bio.en, currentBio.en ?? '')
  const skills = textInput(joinList(builtinProfile.skills), joinList((current.skills as string[]) ?? []))
  const email = textInput(builtinProfile.email, String(current.email ?? ''))
  const github = textInput(builtinProfile.github, String(current.github ?? ''))

  const body = h('div', { class: 'admin-grid' }, [
    field(d['admin.fieldLogin'], login),
    field(`${d['admin.fieldHeadline']}（中文）`, headlineZh),
    field(`${d['admin.fieldHeadline']}（English）`, headlineEn),
    field(`${d['admin.fieldBio']}（中文）`, bioZh),
    field(`${d['admin.fieldBio']}（English）`, bioEn),
    field(d['admin.fieldSkills'], skills),
    field(d['admin.fieldEmail'], email),
    field(d['admin.fieldGithub'], github),
  ])

  const save = button(d['admin.save'])
  const reset = button(d['admin.reset'], 'ghost')

  save.addEventListener('click', () => {
    void (async () => {
      notify(d['admin.saving'])
      const data: Record<string, unknown> = {}
      if (login.value.trim()) data.login = login.value.trim()
      const hl = { zh: headlineZh.value.trim(), en: headlineEn.value.trim() }
      if (hl.zh || hl.en) data.headline = hl
      const bio = { zh: bioZh.value.trim(), en: bioEn.value.trim() }
      if (bio.zh || bio.en) data.bio = bio
      const skillList = parseList(skills.value)
      if (skillList.length) data.skills = skillList
      if (email.value.trim()) data.email = email.value.trim()
      if (github.value.trim()) data.github = github.value.trim()

      const result = await request(`${ADMIN_API_BASE}content`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section: 'profile', data }),
      })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  reset.addEventListener('click', () => {
    void (async () => {
      const result = await request(`${ADMIN_API_BASE}content?section=profile`, { method: 'DELETE' })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  return sectionCard(d['admin.sectionProfile'], d['admin.emptyMeansDefault'], body, [save, reset])
}

/* ------------------------------- 项目 ------------------------------- */

function projectsSection(d: ReturnType<typeof dict>, notify: Notify): HTMLElement {
  const current = (raw.projects?.data ?? {}) as Record<string, unknown>
  const currentDescriptions = (current.descriptions ?? {}) as Record<string, Record<string, string>>

  const rows = h('div', { class: 'admin-grid' })
  for (const project of ownProjects) {
    const override = currentDescriptions[project.name] ?? {}
    const fallback = builtinCurated.descriptions[project.name]?.zh ?? githubDescriptionOf(project.name)
    const fallbackEn = builtinCurated.descriptions[project.name]?.en ?? githubDescriptionOf(project.name)

    const zhInput = textInput(fallback, override.zh ?? '')
    const enInput = textInput(fallbackEn, override.en ?? '')
    zhInput.dataset.repo = project.name
    zhInput.dataset.lang = 'zh'
    enInput.dataset.repo = project.name
    enInput.dataset.lang = 'en'

    rows.append(
      h('div', { class: 'admin-project' }, [
        h('div', { class: 'admin-project__name', text: project.name }),
        zhInput,
        enInput,
      ]),
    )
  }

  // 列表字段预填当前生效值，而不是靠 placeholder 表达默认值
  const effectiveHidden = (current.hidden as string[] | undefined) ?? builtinCurated.hidden
  const order = textInput('', joinList((current.order as string[]) ?? ownProjects.map((p) => p.name)))
  const hidden = textInput('', joinList(effectiveHidden))

  const body = h('div', {}, [
    rows,
    h('div', { class: 'admin-grid admin-grid--tight' }, [
      field(d['admin.fieldOrder'], order),
      field(d['admin.fieldHidden'], hidden),
    ]),
  ])

  const save = button(d['admin.save'])
  const reset = button(d['admin.reset'], 'ghost')

  save.addEventListener('click', () => {
    void (async () => {
      notify(d['admin.saving'])
      const descriptions: Record<string, Record<string, string>> = {}
      for (const input of rows.querySelectorAll<HTMLInputElement>('input[data-repo]')) {
        const name = input.dataset.repo as string
        const lang = input.dataset.lang as 'zh' | 'en'
        const value = input.value.trim()
        if (!value) continue
        descriptions[name] = { ...(descriptions[name] ?? {}), [lang]: value }
      }

      const data: Record<string, unknown> = {}
      if (Object.keys(descriptions).length) data.descriptions = descriptions
      const orderList = parseList(order.value)
      if (orderList.length) data.order = orderList
      // 隐藏列表允许为空（表示「都不隐藏」），所以这里不做跳过
      data.hidden = parseList(hidden.value)

      const result = await request(`${ADMIN_API_BASE}content`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section: 'projects', data }),
      })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  reset.addEventListener('click', () => {
    void (async () => {
      const result = await request(`${ADMIN_API_BASE}content?section=projects`, { method: 'DELETE' })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  return sectionCard(d['admin.sectionProjects'], d['admin.emptyMeansDefault'], body, [save, reset])
}

/* ------------------------------- GitHub 快照 ------------------------------- */

function reposSection(d: ReturnType<typeof dict>, notify: Notify): HTMLElement {
  const stored = raw.repos ?? null
  const source = stored
    ? `${d['admin.reposOverride']} · ${new Date(stored.updatedAt).toLocaleString()}`
    : d['admin.reposBuiltin']

  const body = h('div', {}, [
    h('p', { class: 'admin-hint', text: `${publicRepoCount} ${d['admin.reposCount']}` }),
    h('p', { class: 'admin-hint', text: source }),
  ])

  const refreshButton = button(d['admin.reposRefresh'])
  const reset = button(d['admin.reset'], 'ghost')

  refreshButton.addEventListener('click', () => {
    void (async () => {
      notify(d['admin.reposRefreshing'])
      const result = await request(`${ADMIN_API_BASE}github/snapshot`, { method: 'POST' })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  reset.addEventListener('click', () => {
    void (async () => {
      const result = await request(`${ADMIN_API_BASE}content?section=repos`, { method: 'DELETE' })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  return sectionCard(d['admin.sectionRepos'], d['admin.reposHint'], body, [refreshButton, reset])
}

/* ------------------------------- 站点文案 ------------------------------- */

// 面板会在保存后重绘，这里把筛选状态留在模块里，免得 89 行的列表每次都被重置
let i18nFilter = ''
let i18nOnlyOverridden = false

function i18nSection(d: ReturnType<typeof dict>, notify: Notify): HTMLElement {
  const current = (raw.i18n?.data ?? {}) as Record<string, Record<string, string>>
  const keys = Object.keys(zh) as Array<keyof typeof zh>

  const search = textInput(d['admin.i18nSearch'], i18nFilter)
  const onlyOverridden = h('input', { type: 'checkbox', class: 'admin-checkbox' })
  onlyOverridden.checked = i18nOnlyOverridden

  const rows: HTMLElement[] = []
  const inputs: HTMLInputElement[] = []

  for (const key of keys) {
    const zhOverride = current.zh?.[key] ?? ''
    const enOverride = current.en?.[key] ?? ''
    const zhInput = textInput(zh[key], zhOverride)
    const enInput = textInput(en[key], enOverride)
    zhInput.dataset.key = key
    zhInput.dataset.lang = 'zh'
    enInput.dataset.key = key
    enInput.dataset.lang = 'en'
    inputs.push(zhInput, enInput)

    const row = h('div', { class: 'admin-i18n-row' }, [
      h('code', { class: 'admin-i18n-key', text: key }),
      zhInput,
      enInput,
    ])
    row.dataset.key = key
    row.dataset.overridden = zhOverride || enOverride ? '1' : '0'
    rows.push(row)
  }

  const list = h('div', { class: 'admin-i18n-list' }, rows)
  const applyFilter = (): void => {
    const needle = search.value.trim().toLowerCase()
    const only = onlyOverridden.checked
    for (const row of rows) {
      const matchesText = !needle || (row.dataset.key ?? '').toLowerCase().includes(needle)
      const matchesOverride = !only || row.dataset.overridden === '1'
      row.hidden = !(matchesText && matchesOverride)
    }
  }
  search.addEventListener('input', () => {
    i18nFilter = search.value
    applyFilter()
  })
  onlyOverridden.addEventListener('change', () => {
    i18nOnlyOverridden = onlyOverridden.checked
    applyFilter()
  })
  applyFilter()

  const body = h('div', {}, [
    h('div', { class: 'admin-i18n-toolbar' }, [
      search,
      h('label', { class: 'admin-check' }, [
        onlyOverridden,
        h('span', { text: d['admin.i18nOnlyOverridden'] }),
      ]),
    ]),
    list,
  ])

  const save = button(d['admin.save'])
  const reset = button(d['admin.reset'], 'ghost')

  save.addEventListener('click', () => {
    void (async () => {
      notify(d['admin.saving'])
      const data: Record<string, Record<string, string>> = {}
      for (const input of inputs) {
        const value = input.value.trim()
        if (!value) continue
        const lang = input.dataset.lang as 'zh' | 'en'
        const key = input.dataset.key as string
        data[lang] = { ...(data[lang] ?? {}), [key]: value }
      }

      const result = await request(`${ADMIN_API_BASE}content`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section: 'i18n', data }),
      })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  reset.addEventListener('click', () => {
    void (async () => {
      const result = await request(`${ADMIN_API_BASE}content?section=i18n`, { method: 'DELETE' })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  return sectionCard(d['admin.sectionI18n'], d['admin.emptyMeansDefault'], body, [save, reset])
}

/* ------------------------------- 组装 ------------------------------- */

let rerender: (() => void) | null = null

/** 提示条状态留在模块里：保存后整块重绘，靠它让新渲染出来的提示条接着显示同一句话。 */
let flashState = { text: '', error: false }
let flashElement: HTMLElement | null = null

function notify(text: string, isError = false): void {
  flashState = { text, error: isError }
  if (!flashElement) return
  flashElement.textContent = text
  flashElement.setAttribute('data-kind', isError ? 'error' : 'info')
}

export function setPanelRerender(fn: () => void): void {
  rerender = fn
}

export function renderPanel(): HTMLElement {
  const d = dict(state.lang)
  const container = h('div', { class: 'admin-panel' })

  // 提示条放在各区块之外；notify 写的是模块里记录的最新那条元素，
  // 所以「保存 → 重绘 → 写提示」这条链路不会被重绘打断。
  const flash = h('p', { class: 'admin-status admin-flash', role: 'status', text: flashState.text })
  if (flashState.error) flash.setAttribute('data-kind', 'error')
  flashElement = flash

  const fill = (): void => {
    container.replaceChildren(
      flash,
      profileSection(d, notify),
      projectsSection(d, notify),
      reposSection(d, notify),
      i18nSection(d, notify),
    )
  }

  fill()

  if (!loadedRaw) {
    notify(d['admin.loadingContent'])
    void (async () => {
      raw = await fetchRaw()
      loadedRaw = true
      fill()
      notify('')
    })()
  }

  return container
}

/** 会话失效或退出后清掉缓存，避免换个人登录时看到上一个会话的数据。 */
export function resetPanelCache(): void {
  raw = {}
  loadedRaw = false
  i18nFilter = ''
  i18nOnlyOverridden = false
  flashState = { text: '', error: false }
  flashElement = null
}