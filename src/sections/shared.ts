import { SHOW_TODO_MARKERS } from '../config'
import { ICON, h, svgIcon } from '../dom'

/** TODO 标记。资料补齐后把 src/config.ts 里的开关改成 false 即全部消失。 */
export function todoBadge(): HTMLElement | null {
  if (!SHOW_TODO_MARKERS) return null
  return h('span', { class: 'todo', text: 'TODO' })
}

/** 列表行右侧的「>」箭头。 */
export function chevron(className = 'row__chev'): SVGSVGElement {
  const icon = svgIcon(ICON.chevron)
  icon.setAttribute('class', className)
  return icon
}

/** 外链图标。 */
export function externalIcon(className = 'row__chev'): SVGSVGElement {
  const icon = svgIcon(ICON.external)
  icon.setAttribute('class', className)
  return icon
}

interface SegmentedOption {
  key: string
  /** 文本按钮的显示文字 */
  label?: string
  /** 图标按钮的 SVG 路径常量 */
  icon?: string
  /** 悬停提示与无障碍名称 */
  title: string
}

interface SegmentedConfig {
  ariaLabel: string
  variant?: 'icon'
  options: SegmentedOption[]
  activeIndex: number
  onSelect: (index: number) => void
}

/**
 * MIUIX 胶囊分段控件。
 * 所有按钮等宽（--seg-btn-w），滑块用 translateX(index * 100%) 平移，
 * 因此不需要 JS 测量尺寸。
 */
export function segmented(config: SegmentedConfig): HTMLElement {
  const { options, activeIndex } = config
  const root = h('div', {
    class: config.variant === 'icon' ? 'segmented segmented--icon' : 'segmented',
    role: 'group',
    'aria-label': config.ariaLabel,
    style: `--seg-count:${options.length};--seg-index:${activeIndex}`,
  })

  root.append(h('span', { class: 'segmented__thumb', 'aria-hidden': 'true' }))

  options.forEach((option, index) => {
    const button = h('button', {
      type: 'button',
      class: 'segmented__btn',
      'aria-pressed': index === activeIndex ? 'true' : 'false',
      'aria-label': option.title,
      'data-key': option.key,
    })
    if (option.icon) button.append(svgIcon(option.icon))
    else if (option.label) button.textContent = option.label
    button.addEventListener('click', () => config.onSelect(index))
    root.append(button)
  })

  return root
}