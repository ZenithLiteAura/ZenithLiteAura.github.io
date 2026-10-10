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

  /* ---------------- /verify/ CAPTCHA page ---------------- */

  'verify.metaTitle': 'CAPTCHA · ZenithLiteAura',
  'verify.metaDescription': 'Two CAPTCHAs: Driftcha and Cap.',

  'verify.title': 'CAPTCHA',

  'verify.capUnavailableTitle': 'Cap needs a backend',
  'verify.motionLoad': 'Load Driftcha anyway',

  /* ---------------- /admin/ ---------------- */

  'admin.metaTitle': 'Admin sign-in · ZenithLiteAura',
  'admin.metaDescription': 'Admin sign-in.',

  'admin.title': 'Admin sign-in',
  'admin.subtitle': 'Enter the password and pass the Cap check',
  'admin.password': 'Password',
  'admin.passwordPlaceholder': 'Admin password',
  'admin.signIn': 'Sign in',
  'admin.signingIn': 'Checking…',
  'admin.checking': 'Checking your session…',

  'admin.errorGeneric': 'Incorrect password or CAPTCHA',
  'admin.errorRateLimited': 'Too many attempts. Try again in about {minutes} minutes.',
  'admin.errorNoBackend': 'No backend reachable: /admin only works on the Cloudflare Worker',
  'admin.errorNotConfigured': 'Backend is not fully configured. Missing: {missing}',

  'admin.panelTitle': 'Signed in',
  'admin.panelSubtitle': 'Session is valid',
  'admin.panelBody': 'Content management will live here. This round only wired up the sign-in flow.',
  'admin.sessionExpires': 'Session expires',
  'admin.signOut': 'Sign out',
}