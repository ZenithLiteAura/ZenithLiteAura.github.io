import type { Dict } from './types'

/** 英文文案。键必须与 src/i18n/zh.ts 完全一致。 */
export const en: Dict = {
  'meta.title': 'ZenithLiteAura · Home',
  'meta.description':
    'Personal homepage of ZenithLiteAura — MIUIX / HyperOS style, bilingual.',

  'a11y.lang': 'Switch language',
  'a11y.theme': 'Switch theme',
  'a11y.openDetail': 'View project details',
  'a11y.close': 'Close',

  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  'hero.badge.repos': 'public repos',
  'hero.badge.joined': 'joined',
  'hero.badge.followers': 'followers',
  // 英文单复数：数量为 1 时用这一条
  'hero.badge.follower': 'follower',

  'section.about': 'About',
  'section.skills': 'Skills & tools',
  'section.projects': 'Projects',
  'section.contact': 'Get in touch',

  'projects.todo': 'Repository description to be added',
  'projects.stars': 'stars',
  'projects.updated': 'updated',
  'projects.archived': 'archived',
  'projects.viewAll': 'View all {n} repositories on GitHub',
  'projects.empty': 'No project data yet.',

  'detail.title': 'Project details',
  'detail.language': 'Language',
  'detail.stars': 'Stars',
  'detail.updated': 'Last updated',
  'detail.homepage': 'Homepage',
  'detail.open': 'Open on GitHub',
  'detail.none': 'None',

  'contact.github': 'GitHub',
  'contact.email': 'Email',
  'contact.pending': 'To be added',

  'footer.built': 'MIUIX-style · hand-written CSS · no framework',
  'footer.source': 'View source',
  'footer.langNote': 'Bilingual',

  /* ---------------- /verify/ comparison page ---------------- */

  'verify.metaTitle': 'CAPTCHA demo · ZenithLiteAura',
  'verify.metaDescription': 'Driftcha vs Cap: two CAPTCHA approaches, side by side.',

  'verify.title': 'CAPTCHA',
  'verify.subtitle': 'Driftcha vs Cap',

  'verify.lead':
    'Both are mounted on this page so you can compare them directly. The key difference: Driftcha runs fully static, while Cap needs a backend.',

  'verify.tableTitle': 'Comparison',
  'verify.colFeature': 'Aspect',
  'verify.colDriftcha': 'Driftcha',
  'verify.colCap': 'Cap',

  'verify.driftchaTitle': 'Driftcha · motion noise',
  'verify.driftchaMode': 'Browser-only · no server',
  'verify.driftchaNote':
    'Everything runs in the page. No pass token is issued and this is not real protection — upstream calls it "a speed bump, not a defense".',

  'verify.capTitle': 'Cap · invisible proof-of-work',
  'verify.capLoading': 'Probing the Cap backend…',
  'verify.capHint': 'On success the server issues a token you can verify later.',
  'verify.capUnavailableTitle': 'Cap needs a backend',
  'verify.capUnavailableBody':
    'No /verify/cap/ backend is reachable here (GitHub Pages is static hosting). npm run dev mounts one locally; in production a Cloudflare Worker provides it.',
  'verify.capSolved': 'Solved, token:',
  'verify.capError': 'Error',

  'verify.a11yTitle': 'Accessibility',
  'verify.a11yBody':
    'Driftcha depends on motion vision: screen-reader users and people with low vision cannot solve it, and it may be unpleasant for those sensitive to motion. Cap is invisible, with no visual puzzle. To reach me, email:',

  'verify.motionTitle': 'Reduced motion is on',
  'verify.motionBody': 'Driftcha animates continuously, so it was not loaded automatically.',
  'verify.motionLoad': 'Load Driftcha anyway',

  'verify.footnote': 'This page is a self-test; it is not wired to any real form.',
  'verify.back': 'Back to home',
}