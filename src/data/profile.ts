import type { ContactLink, LocalizedText } from '../types'

/**
 * 个人资料 —— 全站唯一的文案来源。
 *
 * ⚠️ TODO(user)：下面标了 TODO 的地方都是自动填充的占位内容，
 * 请按你的真实情况替换；替换后把 src/config.ts 里的 SHOW_TODO_MARKERS 改成 false。
 */
export const profile = {
  /** GitHub 用户名（已核实）。 */
  login: 'ZenithLiteAura',
  /** TODO(user)：提交记录里的署名是 Nahida。决定主页只显示哪个，或都保留。 */
  alias: 'Nahida',
  avatar: '/avatar.jpg',
  github: 'https://github.com/ZenithLiteAura',

  /** 以下三项取自 GitHub 账号（已核实）。 */
  joined: '2024-05-18T05:46:54Z',
  followers: 1,

  /** TODO(user)：一句话签名，替换成你自己的。 */
  headline: {
    zh: '做点小而美的工具',
    en: 'Building small, polished tools',
  } as LocalizedText,

  /** TODO(user)：自我介绍，替换成你自己的（GitHub 个人简介目前只有「ohhhh」）。 */
  bio: {
    zh: '你好，我是 ZenithLiteAura。这里会放一段两三句话的自我介绍：你在做什么、关心什么方向、最近在折腾什么。',
    en: 'Hi, I am ZenithLiteAura. This is where a two-or-three sentence introduction goes: what you work on, what you care about, and what you are tinkering with lately.',
  } as LocalizedText,

  /** TODO(user)：技能与工具，下面是占位示例，请替换。 */
  skills: ['Dart', 'Flutter', 'TypeScript', 'C#'],

  /** 联系方式。邮箱等留空 → 页面上显示「待补充」，不会公开任何未确认的信息。 */
  contacts: [
    {
      id: 'github',
      labelKey: 'contact.github',
      value: 'github.com/ZenithLiteAura',
      href: 'https://github.com/ZenithLiteAura',
      todo: false,
    },
    // TODO(user)：填上 value/href 并把 todo 改为 false，即可自动出现在「联系我」里。
    { id: 'email', labelKey: 'contact.email', value: '', href: '', todo: true },
    { id: 'qq', labelKey: 'contact.qq', value: '', href: '', todo: true },
    { id: 'bilibili', labelKey: 'contact.bilibili', value: '', href: '', todo: true },
  ] satisfies ContactLink[],
}