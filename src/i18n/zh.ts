/** 中文文案（默认语言）。键名即 src/i18n/en.ts 必须一一对应的键。 */
export const zh = {
  'meta.title': 'ZenithLiteAura · 个人主页',
  'meta.description': 'ZenithLiteAura 的个人主页 —— MIUIX / HyperOS 风格，中英双语。',

  'a11y.lang': '切换语言',
  'a11y.theme': '切换主题',
  'a11y.openDetail': '查看项目详情',
  'a11y.close': '关闭',

  'theme.light': '浅色',
  'theme.dark': '深色',
  'theme.system': '跟随系统',

  'hero.badge.repos': '公开仓库',
  'hero.badge.joined': '加入于',
  'hero.badge.followers': '关注者',
  'hero.badge.follower': '关注者',

  'section.about': '关于',
  'section.skills': '技能与工具',
  'section.projects': '项目',
  'section.contact': '联系我',

  'projects.todo': '待补充仓库描述',
  'projects.stars': '星标',
  'projects.updated': '更新于',
  'projects.archived': '已归档',
  'projects.viewAll': '在 GitHub 查看全部 {n} 个仓库',
  'projects.empty': '暂无项目数据。',

  'detail.title': '项目详情',
  'detail.language': '语言',
  'detail.stars': '星标',
  'detail.updated': '最近更新',
  'detail.homepage': '项目主页',
  'detail.open': '在 GitHub 打开',
  'detail.none': '无',

  'contact.github': 'GitHub',
  'contact.email': '电子邮箱',
  'contact.pending': '待补充',

  'footer.built': 'MIUIX 风格 · 手写 CSS · 无前端框架',
  'footer.source': '查看源码',
  'footer.langNote': '中英双语',

  /* ---------------- /verify/ 验证码页 ---------------- */

  'verify.metaTitle': '验证码 · ZenithLiteAura',
  'verify.metaDescription': 'Driftcha 与 Cap 两个验证码。',

  'verify.title': '验证码',

  'verify.capUnavailableTitle': 'Cap 需要一个后端',
  'verify.motionLoad': '仍要加载 Driftcha',

  /* ---------------- /admin/ 后台 ---------------- */

  'admin.metaTitle': '后台登录 · ZenithLiteAura',
  'admin.metaDescription': '管理后台登录。',

  'admin.title': '后台登录',
  'admin.subtitle': '输入密码，并通过 Cap 验证',
  'admin.password': '密码',
  'admin.passwordPlaceholder': '输入管理员密码',
  'admin.signIn': '登录',
  'admin.signingIn': '正在验证…',
  'admin.checking': '正在检查会话…',

  'admin.errorGeneric': '密码或验证码不正确',
  'admin.errorRateLimited': '尝试次数过多，请约 {minutes} 分钟后再试',
  'admin.errorNoBackend': '连接不上后端：/admin 只能在 Cloudflare Worker 上使用',
  'admin.errorNotConfigured': '后端配置不全，缺少：{missing}',

  'admin.panelTitle': '已登录',
  'admin.panelSubtitle': '会话有效',
  'admin.panelBody': '这里以后放内容管理。本次只跑通了登录链路。',
  'admin.sessionExpires': '会话到期',
  'admin.signOut': '退出登录',

  'admin.sectionProfile': '个人资料',
  'admin.sectionProjects': '项目',
  'admin.sectionRepos': 'GitHub 快照',
  'admin.sectionI18n': '站点文案',
  'admin.emptyMeansDefault': '留空 = 沿用默认值（灰色文字就是默认值）',
  'admin.fieldLogin': '显示名',
  'admin.fieldHeadline': '一句话签名',
  'admin.fieldBio': '自我介绍',
  'admin.fieldSkills': '技能（逗号分隔）',
  'admin.fieldEmail': '邮箱',
  'admin.fieldGithub': 'GitHub 链接',
  'admin.fieldOrder': '显示顺序（仓库名，逗号分隔）',
  'admin.fieldHidden': '不上首页的仓库（逗号分隔）',
  'admin.save': '保存',
  'admin.saving': '保存中…',
  'admin.saved': '已保存，约 30 秒内生效',
  'admin.saveFailed': '保存失败',
  'admin.reset': '清空覆盖',
  'admin.expired': '会话已过期，请重新登录',
  'admin.loadingContent': '正在读取现有覆盖…',
  'admin.reposCount': '个公开仓库',
  'admin.reposRefresh': '重新抓取并保存',
  'admin.reposRefreshing': '正在抓取…',
  'admin.reposHint': '从 GitHub 重新拉取公开仓库快照（自动过滤 private 仓库）。',
  'admin.reposOverride': '使用后台保存的快照',
  'admin.reposBuiltin': '使用构建时的快照',
  'admin.i18nSearch': '搜索键名…',
  'admin.i18nOnlyOverridden': '只看已覆盖',
  'admin.viewSite': '查看站点',
  'admin.publicHint':
    '保存后公开页面约 30 秒内生效（页面启动时拉一次覆盖）；刷新首页即可看到。',
} as const