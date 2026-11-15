import { ADMIN_API_BASE } from './admin-shared'
import { builtinLinks, isLayout, LAYOUTS } from '../data/links'
import { h } from '../dom'
import { dict } from '../i18n'
import { loadContentOverrides } from '../content/overrides'
import { state } from '../store'
import type { ContentSection, StoredSection } from '../content/content-shared'

/**
 * 管理面板：只保留「链接页」这一件事。
 *
 * 编辑的是**覆盖层**而不是最终内容：保存后写进 KV，公开页 /links/ 拉 /content.json 合并。
 * 编辑框预填当前生效值，所以在输入框里看到的就是线上正在用的东西。
 */

type RawSections = Partial<Record<ContentSection, StoredSection | null>>
type Notify = (text: string, isError?: boolean) => void

let raw: RawSections = {}
let loadedRaw = false

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

async function fetchRaw(): Promise<RawSections> {
  const result = await request(`${ADMIN_API_BASE}content`)
  if (!result.ok) return {}
  const body = result.data as { sections?: RawSections } | null
  return body?.sections ?? {}
}

/** 保存/清空成功后：重新拉覆盖 + 重绘面板，再把提示写到不会被重绘冲掉的那条横条上。 */
async function afterWrite(d: ReturnType<typeof dict>, notify: Notify): Promise<void> {
  await loadContentOverrides(3000)
  raw = await fetchRaw()
  rerender?.()
  notify(d['admin.saved'])
}

/* ------------------------------- 链接页 ------------------------------- */

function linksSection(d: ReturnType<typeof dict>, notify: Notify): HTMLElement {
  const current = (raw.links?.data ?? {}) as { layout?: unknown; items?: unknown }
  const source = Array.isArray(current.items) && current.items.length
    ? (current.items as Array<Record<string, unknown>>)
    : (builtinLinks.items as unknown as Array<Record<string, unknown>>)

  const layoutSelect = h('select', { class: 'admin-input admin-select' })
  for (const value of LAYOUTS) {
    const labelKey = ('layout.' + value) as keyof ReturnType<typeof dict>
    layoutSelect.append(h('option', { value, text: d[labelKey] }))
  }
  layoutSelect.value = isLayout(current.layout) ? current.layout : builtinLinks.layout

  type Row = { root: HTMLElement; label: HTMLInputElement; href: HTMLInputElement; desc: HTMLInputElement }
  const rows: Row[] = []
  const byRoot = new Map<HTMLElement, Row>()
  const rowsHost = h('div', { class: 'admin-link-rows' })
  let dragging: HTMLElement | null = null

  /** 顺序以 DOM 为准：拖动/上下移之后从 DOM 重建 rows，保存时自然就是新顺序。 */
  const syncOrder = (): void => {
    const ordered = [...rowsHost.children]
      .map((el) => byRoot.get(el as HTMLElement))
      .filter((row): row is Row => Boolean(row))
    rows.length = 0
    rows.push(...ordered)
  }

  const move = (root: HTMLElement, direction: -1 | 1): void => {
    const sibling = direction === -1 ? root.previousElementSibling : root.nextElementSibling
    if (!sibling) return
    if (direction === -1) rowsHost.insertBefore(root, sibling)
    else rowsHost.insertBefore(sibling, root)
    syncOrder()
  }

  const addRow = (item: Record<string, unknown>): void => {
    const label = textInput(d['admin.fieldLinkLabel'], typeof item.label === 'string' ? item.label : '')
    const href = textInput(d['admin.fieldLinkHref'], typeof item.href === 'string' ? item.href : '')
    const desc = textInput(d['admin.fieldLinkDesc'], typeof item.desc === 'string' ? item.desc : '')

    // 拖动只认手柄：在输入框上按下应该选文字，而不是把整行拖走
    const handle = h('span', {
      class: 'admin-drag',
      draggable: 'true',
      role: 'button',
      tabindex: '0',
      title: d['admin.dragHint'],
      'aria-label': d['admin.dragHint'],
      text: '⠿',
    })
    const up = button('↑', 'ghost')
    const down = button('↓', 'ghost')
    const remove = button('✕', 'ghost')

    const root = h('div', { class: 'admin-link-row' }, [handle, label, href, desc, up, down, remove])
    const entry: Row = { root, label, href, desc }
    byRoot.set(root, entry)
    rows.push(entry)
    rowsHost.append(root)

    handle.addEventListener('dragstart', (event) => {
      dragging = root
      root.classList.add('is-dragging')
      event.dataTransfer?.setData('text/plain', '')
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    })
    handle.addEventListener('dragend', () => {
      dragging = null
      root.classList.remove('is-dragging')
      syncOrder()
    })

    up.addEventListener('click', () => move(root, -1))
    down.addEventListener('click', () => move(root, 1))
    remove.addEventListener('click', () => {
      const index = rows.indexOf(entry)
      if (index >= 0) rows.splice(index, 1)
      byRoot.delete(root)
      root.remove()
    })
  }

  for (const item of source) addRow(item)

  // 行与行之间的落点：按指针在目标行的上半/下半决定插到前面还是后面
  rowsHost.addEventListener('dragover', (event) => {
    if (!dragging) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    const target = (event.target as HTMLElement).closest('.admin-link-row')
    if (!target || target === dragging) return
    const rect = target.getBoundingClientRect()
    const after = event.clientY > rect.top + rect.height / 2
    rowsHost.insertBefore(dragging, after ? target.nextElementSibling : target)
  })
  rowsHost.addEventListener('drop', (event) => {
    event.preventDefault()
    if (!dragging) return
    dragging.classList.remove('is-dragging')
    dragging = null
    syncOrder()
  })

  const add = button(d['admin.addLink'], 'ghost')
  add.addEventListener('click', () => addRow({}))

  const save = button(d['admin.save'])
  const reset = button(d['admin.reset'], 'ghost')

  save.addEventListener('click', () => {
    void (async () => {
      notify(d['admin.saving'])
      syncOrder()
      const items = rows
        .map((row) => ({
          label: row.label.value.trim(),
          href: row.href.value.trim(),
          desc: row.desc.value.trim(),
        }))
        .filter((item) => item.label && item.href)
      if (!items.length) {
        notify(d['admin.linksEmpty'], true)
        return
      }
      const result = await request(`${ADMIN_API_BASE}content`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section: 'links', data: { layout: layoutSelect.value, items } }),
      })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  reset.addEventListener('click', () => {
    void (async () => {
      const result = await request(`${ADMIN_API_BASE}content?section=links`, { method: 'DELETE' })
      if (result.ok) await afterWrite(d, notify)
      else notify(describeError(d, result), true)
    })()
  })

  const body = h('div', {}, [field(d['admin.fieldLayout'], layoutSelect), rowsHost])
  return sectionCard(d['admin.sectionLinks'], d['admin.linksHint'], body, [add, save, reset])
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

  const flash = h('p', { class: 'admin-status admin-flash', role: 'status', text: flashState.text })
  if (flashState.error) flash.setAttribute('data-kind', 'error')
  flashElement = flash

  const fill = (): void => {
    container.replaceChildren(flash, linksSection(d, notify))
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
}
