import type { Dict } from './types.ts'

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

  'verify.overline': '~/lab — captcha lab',
  'verify.lede': 'Two checks, in order: clear the human check, then read the digits drifting in the noise.',
  'verify.step1Title': 'Human check',
  'verify.step1Sub': 'One click on the checkbox; Cap does the rest.',
  'verify.step2Title': 'Digits in noise',
  'verify.step2Sub': 'The digits drift through animated noise. Read them, then type each one.',
  'verify.stepLocked': 'Unlocks after step 01',
  'verify.stepLockedChip': 'locked',
  'verify.stepWaiting': 'waiting',
  'verify.stepPassed': 'passed',
  'verify.doneTitle': 'Confirmed: human',
  'verify.doneBody': 'Both checks passed.',
  'verify.doneMeta': '2 / 2 passed · human verified',
  'verify.restart': 'Run it again',

  /* ---------------- /admin/ ---------------- */

  'admin.metaTitle': 'Admin sign-in · ZenithLiteAura',
  'admin.metaDescription': 'Admin sign-in.',

  'admin.title': 'Admin sign-in',
  'admin.username': 'Username',
  'admin.usernamePlaceholder': 'Admin username',
  'admin.password': 'Password',
  'admin.passwordPlaceholder': 'Admin password',
  'admin.signIn': 'Sign in',
  'admin.signingIn': 'Checking…',
  'admin.checking': 'Checking your session…',

  'admin.errorGeneric': 'Incorrect username, password, or CAPTCHA',
  'admin.errorCaptchaRequired': 'Please complete the CAPTCHA first',
  'admin.errorRateLimited': 'Too many attempts. Try again in about {minutes} minutes.',
  'admin.errorNoBackend': 'No backend reachable: /admin only works on the Cloudflare Worker',
  'admin.errorNotConfigured': 'Backend is not fully configured. Missing: {missing}',

  'admin.panelTitle': 'Signed in',
  'admin.panelBody': 'Content management will live here. This round only wired up the sign-in flow.',
  'admin.sessionExpires': 'Session expires',
  'admin.signOut': 'Sign out',

  'admin.sectionProfile': 'Profile',
  'admin.sectionProjects': 'Projects',
  'admin.sectionRepos': 'GitHub snapshot',
  'admin.sectionI18n': 'Site copy',
  'admin.emptyMeansDefault': 'Empty = use the default (grey text shows the default)',
  'admin.fieldLogin': 'Display name',
  'admin.fieldHeadline': 'Tagline',
  'admin.fieldBio': 'About',
  'admin.fieldSkills': 'Skills (comma separated)',
  'admin.fieldEmail': 'Email',
  'admin.fieldGithub': 'GitHub URL',
  'admin.fieldOrder': 'Display order (repo names, comma separated)',
  'admin.fieldHidden': 'Repos hidden from the homepage (comma separated)',
  'admin.save': 'Save',
  'admin.saving': 'Saving…',
  'admin.saved': 'Saved — live within about 30 seconds',
  'admin.saveFailed': 'Save failed',
  'admin.reset': 'Clear override',
  'admin.expired': 'Session expired — sign in again',
  'admin.loadingContent': 'Reading current overrides…',
  'admin.reposCount': 'public repos',
  'admin.reposRefresh': 'Re-fetch and save',
  'admin.reposRefreshing': 'Fetching…',
  'admin.reposHint': 'Re-fetch the public repo snapshot from GitHub (private repos are filtered out).',
  'admin.reposOverride': 'Using the snapshot saved from the admin',
  'admin.reposBuiltin': 'Using the build-time snapshot',
  'admin.i18nSearch': 'Search keys…',
  'admin.i18nOnlyOverridden': 'Only overridden',
  'admin.viewSite': 'View site',
  'admin.publicHint':
    'After saving, the public pages pick it up within about 30 seconds (they fetch overrides on load). Refresh the homepage to see it.',
}