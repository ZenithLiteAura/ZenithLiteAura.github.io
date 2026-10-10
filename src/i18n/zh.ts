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

  /* ---------------- /verify/ 对比页 ---------------- */

  'verify.metaTitle': '验证码演示 · ZenithLiteAura',
  'verify.metaDescription': 'Driftcha 与 Cap 两种验证码方案的对比与现场演示。',

  'verify.title': '验证码',
  'verify.subtitle': 'Driftcha 与 Cap 对比',

  'verify.lead':
    '同一个页面上各挂一个，方便直接比较。两者最关键的差别是：Driftcha 可以纯静态运行，Cap 必须有一个后端。',

  'verify.tableTitle': '对比',
  'verify.colFeature': '维度',
  'verify.colDriftcha': 'Driftcha',
  'verify.colCap': 'Cap',

  'verify.driftchaTitle': 'Driftcha · 运动噪点',
  'verify.driftchaMode': '浏览器模式 · 无服务端',
  'verify.driftchaNote':
    '所有计算都在页面内完成，不产生 pass token，也不构成真实防护——上游自己把它称作「速度障碍，而不是防御」。',

  'verify.capTitle': 'Cap · 隐形工作量证明',
  'verify.capLoading': '正在探测 Cap 后端…',
  'verify.capHint': '通过后由服务端签发一个可再校验的 token。',
  'verify.capUnavailableTitle': 'Cap 需要一个后端',
  'verify.capUnavailableBody':
    '当前环境没有 /verify/cap/ 后端（GitHub Pages 是纯静态托管）。本地 npm run dev 会自动挂上后端；线上由 Cloudflare Worker 提供。',
  'verify.capSolved': '已通过，token：',
  'verify.capError': '出错',

  'verify.a11yTitle': '无障碍',
  'verify.a11yBody':
    'Driftcha 依赖运动视觉：屏幕阅读器用户与低视力用户无法完成，对运动敏感的人也不友好。Cap 是隐形的、没有视觉谜题。需要联系我请直接发邮件：',

  'verify.motionTitle': '检测到「减少动态效果」',
  'verify.motionBody': 'Driftcha 会持续播放运动噪点，因此默认没有自动加载。',
  'verify.motionLoad': '仍要加载 Driftcha',

  'verify.footnote': '本页是自测页面，未接入任何真实表单。',
  'verify.back': '返回主页',
} as const