/**
 * 全站配置开关。
 *
 * SHOW_TODO_MARKERS：目前资料已补齐，因此为 false，页面上不会出现任何「待补充 / TODO」标记。
 * 以后新增了还没填描述的仓库，把它改成 true 就能把待办提示显示出来。
 *
 * 个人资料请改 src/data/profile.ts，项目描述改 src/data/curated.ts，
 * 仓库快照改 src/data/repos.snapshot.json。
 */
export const SHOW_TODO_MARKERS = false

/** 站点主域（用于 og / canonical 与页脚链接）。 */
export const SITE_URL = 'https://zenithliteaura.github.io'