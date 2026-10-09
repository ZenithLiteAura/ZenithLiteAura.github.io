import { h } from './dom'
import { renderAbout, renderSkills } from './sections/about'
import { renderAppBar } from './sections/appbar'
import { renderContact, renderFooter } from './sections/contact'
import { renderHero } from './sections/hero'
import { renderForks, renderProjects } from './sections/projects'

/**
 * 组装整页。
 *
 * animate 只在首次渲染时为 true：语言/主题切换会整页重渲染，
 * 若每次都播放入场动画会明显闪烁。
 */
export function renderApp(root: HTMLElement, animate: boolean): void {
  const page = h('div', { class: 'page' })

  const sections = [
    renderHero(),
    renderAbout(),
    renderSkills(),
    renderProjects(),
    renderForks(),
    renderContact(),
    renderFooter(),
  ]

  sections.forEach((section, index) => {
    if (animate) {
      section.style.setProperty('--i', String(index))
      section.classList.add('enter')
    }
    page.append(section)
  })

  root.replaceChildren(renderAppBar(), page)
}