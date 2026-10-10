import type { ContactLink, LocalizedText } from '../types'

/** 公开邮箱：主页的联系方式与 /verify/ 页的无障碍替代入口共用同一处定义。 */
const EMAIL = 'admin@zenithliteaura.site'

/**
 * 个人资料 —— 全站唯一的文案来源。
 * 这里的内容都已确认，页面上不再有 TODO 占位。
 */
export const profile = {
  /** 显示名（GitHub 用户名）。 */
  login: 'ZenithLiteAura',
  avatar: '/avatar.jpg',
  github: 'https://github.com/ZenithLiteAura',
  /** 公开邮箱。 */
  email: EMAIL,

  /** 账号信息，取自 GitHub。 */
  joined: '2024-05-18T05:46:54Z',
  followers: 1,

  /** 一句话签名。 */
  headline: {
    zh: '爱折腾，能自己搭的就自己搭',
    en: 'Tinkerer. If I can self-host it, I will.',
  } as LocalizedText,

  /** 自我介绍。 */
  bio: {
    zh: '平时主要写 Python，闲下来的时间基本都在折腾。邮箱、相册这些能自建的东西，都搬到了自己的服务器上，跑通了就顺手丢到 GitHub。想聊什么发邮件就行。',
    en: 'I mostly write Python and tinker with the rest of my time. Mail, photos, anything I can host myself ends up on my own server, and whatever survives gets pushed to GitHub. Feel free to email me.',
  } as LocalizedText,

  /** 技能与工具。想加别的，直接往数组里加字符串。 */
  skills: ['Python'],

  /** 联系方式。GitHub 走外链，邮箱走 mailto。 */
  contacts: [
    {
      id: 'github',
      labelKey: 'contact.github',
      value: 'github.com/ZenithLiteAura',
      href: 'https://github.com/ZenithLiteAura',
      todo: false,
    },
    {
      id: 'email',
      labelKey: 'contact.email',
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      todo: false,
    },
  ] satisfies ContactLink[],
}