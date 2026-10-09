import type { LocalizedText } from '../types'

/**
 * 手写的项目描述。
 *
 * 页面优先用这里的文案；没有条目的仓库回落到 GitHub 上的仓库简述。
 * 以后加了新仓库，想自己写介绍就往这里加一条（键名 = 仓库名）。
 */
export const curatedDescriptions: Record<string, LocalizedText> = {
  Pho_Community: {
    zh: '无服务端的照片浏览与同步应用。照片按日期直接存放在你自己的 SMB / WebDAV / NFS 存储上，不建数据库、不需要账号。',
    en: 'A serverless photo browsing and sync app. Photos sit on your own SMB / WebDAV / NFS storage, organised by date. No database, no account.',
  },
}

/**
 * 不上个人主页的仓库。
 *
 * cuddly-guide：建仓库时自动生成的空占位，里面只有一个 LICENSE 和 14 字节的 README，
 * 没有任何内容，所以不放进首页的项目卡片。
 */
export const hiddenRepos: string[] = ['cuddly-guide']