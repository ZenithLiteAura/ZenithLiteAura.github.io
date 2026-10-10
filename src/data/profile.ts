import type { ContactLink, LocalizedText } from '../types'

const DEFAULT_EMAIL = 'admin@zenithliteaura.site'
const DEFAULT_GITHUB = 'https://github.com/ZenithLiteAura'

/** 后台可以覆盖的字段；留空表示沿用默认值。 */
export interface ProfileOverride {
  login?: string
  headline?: LocalizedText
  bio?: LocalizedText
  skills?: string[]
  email?: string
  github?: string
}

/**
 * 个人资料 —— 全站唯一的文案来源。
 *
 * 构建时是下面这份默认值；页面启动时会拉一次 KV 覆盖（见 src/content/overrides.ts），
 * 拉到就覆写这些字段，拉不到（例如 GitHub Pages 没有后端）就继续用默认值。
 */
export const profile = {
  /** 显示名（GitHub 用户名）。 */
  login: 'ZenithLiteAura',
  avatar: '/avatar.jpg',
  github: DEFAULT_GITHUB,
  /** 公开邮箱。 */
  email: DEFAULT_EMAIL,

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

  /** 技能与工具。 */
  skills: ['Python'],
}

/** 默认值快照：后台表单用它当 placeholder（profile 会被覆盖改写，所以另存一份）。 */
export const builtinProfile = {
  login: profile.login,
  headline: { ...profile.headline },
  bio: { ...profile.bio },
  skills: [...profile.skills],
  email: profile.email,
  github: profile.github,
}

/**
 * 套用覆盖。**先把字段重置回默认值再套**，否则后台「清空覆盖」之后内存里会残留旧值
 * （页面要整页刷新才恢复）。
 */
export function applyProfileOverride(override: ProfileOverride): void {
  profile.login = builtinProfile.login
  profile.headline = { ...builtinProfile.headline }
  profile.bio = { ...builtinProfile.bio }
  profile.skills = [...builtinProfile.skills]
  profile.email = builtinProfile.email
  profile.github = builtinProfile.github

  if (override.login) profile.login = override.login
  if (override.headline) profile.headline = override.headline
  if (override.bio) profile.bio = override.bio
  if (override.skills) profile.skills = override.skills
  if (override.email) profile.email = override.email
  if (override.github) profile.github = override.github
}

/** 联系方式由 github / email 派生，因此后台只要改这两个字段。 */
export function contactEntries(): ContactLink[] {
  return [
    {
      id: 'github',
      labelKey: 'contact.github',
      value: profile.github.replace(/^https?:\/\//, ''),
      href: profile.github,
      todo: false,
    },
    {
      id: 'email',
      labelKey: 'contact.email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      todo: false,
    },
  ]
}