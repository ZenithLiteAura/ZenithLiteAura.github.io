/**
 * 极小的 DOM 构建工具。
 *
 * 全程用 createElement + textContent 组装，不用字符串拼 HTML，
 * 因此仓库描述等外部文本不会被当作标记解析（避免 XSS）。
 */

type Attrs = Record<string, string | number | boolean | null | undefined>

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue
    if (key === 'class') node.className = String(value)
    else if (key === 'text') node.textContent = String(value)
    else node.setAttribute(key, value === true ? '' : String(value))
  }
  for (const child of children) node.append(child)
  return node
}

/** 内置常量图标专用（不接受任何外部/用户输入）。 */
export function svgIcon(inner: string, viewBox = '0 0 24 24'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', viewBox)
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.innerHTML = inner
  return svg
}

export const ICON = {
  chevron:
    '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  external:
    '<path d="M14 5h5v5M19 5l-7.5 7.5M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 2.9v2.1M12 19v2.1M2.9 12h2.1M19 12h2.1M5.5 5.5l1.5 1.5M17 17l1.5 1.5M18.5 5.5L17 7M7 17l-1.5 1.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  moon: '<path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
  auto: '<circle cx="12" cy="12" r="8.3" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 3.7a8.3 8.3 0 0 1 0 16.6Z" fill="currentColor"/>',
  star: '<path d="m12 4.6 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.9l5-.7Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  github:
    '<path d="M12 3.2a8.8 8.8 0 0 0-2.8 17.2c.44.08.6-.19.6-.42v-1.5c-2.45.53-2.96-1.18-2.96-1.18-.4-1.02-.98-1.29-.98-1.29-.8-.55.06-.54.06-.54.88.06 1.35.91 1.35.91.79 1.34 2.06.95 2.56.73.08-.57.31-.96.56-1.18-1.96-.22-4.02-.98-4.02-4.36 0-.96.34-1.75.9-2.37-.09-.22-.39-1.12.09-2.33 0 0 .74-.24 2.42.9a8.4 8.4 0 0 1 4.4 0c1.68-1.14 2.42-.9 2.42-.9.48 1.21.18 2.11.09 2.33.56.62.9 1.41.9 2.37 0 3.39-2.07 4.14-4.04 4.36.32.27.6.8.6 1.62v2.4c0 .23.16.5.61.42A8.8 8.8 0 0 0 12 3.2Z" fill="currentColor"/>',
  close:
    '<path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
} as const