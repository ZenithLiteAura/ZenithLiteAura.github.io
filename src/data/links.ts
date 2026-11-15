export type LinkLayout = 'list' | 'grid' | 'index' | 'inline'

export interface LinkItem {
  /** 显示文字 */
  label: string
  /** 实际跳转地址 */
  href: string
  /** 一行说明，可为空 */
  desc: string
}

export interface LinkContent {
  layout: LinkLayout
  items: LinkItem[]
}

export const LAYOUTS: readonly LinkLayout[] = ['list', 'grid', 'index', 'inline']

export const isLayout = (value: unknown): value is LinkLayout =>
  typeof value === 'string' && (LAYOUTS as readonly string[]).includes(value)

/** 构建时的默认链接页；后台保存的覆盖层会盖在上面 */
export const builtinLinks: LinkContent = {
  layout: 'index',
  items: [
    { label: 'GitHub', href: 'https://github.com/ZenithLiteAura', desc: '代码都在这儿' },
    {
      label: 'Pho_Community',
      href: 'https://github.com/ZenithLiteAura/Pho_Community',
      desc: '自建相册 · SMB / WebDAV / NFS',
    },
    { label: '邮箱', href: 'mailto:admin@zenithliteaura.site', desc: '想聊就写信' },
    { label: '验证码实验', href: '/verify/', desc: 'Cap + 噪点数字，两步验证' },
    { label: '折腾记录', href: '/', desc: '回到首页' },
  ],
}

const clipped = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/** 唯一的地址白名单：http(s) / mailto / 站内绝对路径 / 锚点 */
export const isSafeHref = (href: string): boolean => /^(https?:\/\/|mailto:|\/|#)/.test(href)

/** 合并 KV 覆盖层。任何字段不合法都退回默认值，不让坏数据把页面搞空。 */
export function mergeLinks(override: unknown): LinkContent {
  if (!override || typeof override !== 'object') return builtinLinks
  const source = override as Record<string, unknown>
  const layout = isLayout(source.layout) ? source.layout : builtinLinks.layout

  const items: LinkItem[] = []
  if (Array.isArray(source.items)) {
    for (const raw of source.items.slice(0, 40)) {
      if (!raw || typeof raw !== 'object') continue
      const item = raw as Record<string, unknown>
      const label = clipped(item.label, 60)
      const href = clipped(item.href, 500)
      if (!label || !href || !isSafeHref(href)) continue
      items.push({ label, href, desc: clipped(item.desc, 160) })
    }
  }

  return { layout, items: items.length ? items : builtinLinks.items }
}
