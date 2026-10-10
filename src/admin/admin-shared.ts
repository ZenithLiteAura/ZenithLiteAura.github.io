/**
 * 管理后台的路径与策略常量。浏览器侧与服务端共用（不含任何服务端依赖）。
 */

/** 后台 API 基址；widget 会请求 `${ADMIN_API_BASE}cap/challenge` 与 `${ADMIN_API_BASE}cap/redeem`。 */
export const ADMIN_API_BASE = '/admin/api/'

/** 会话 cookie 名与作用路径（限制到 /admin，避免其它子路径携带）。 */
export const SESSION_COOKIE = 'admin_session'
export const SESSION_COOKIE_PATH = '/admin'

/** 会话有效期：7 天，不做续期。 */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

/** Cap 通过后签发的一次性凭证有效期：2 分钟。 */
export const CAP_TOKEN_TTL_MS = 120_000

/** 后台 Cap 使用独立 scope，与公开页面完全隔离。 */
export const ADMIN_CAP_SCOPE = 'admin'

/** 登录限流：窗口 15 分钟，最多 10 次尝试，连续失败 5 次锁定。 */
export const LOGIN_WINDOW_SECONDS = 900
export const LOGIN_MAX_ATTEMPTS = 10
export const LOGIN_MAX_FAILURES = 5

export const isAdminApiPath = (pathname: string): boolean => pathname.startsWith(ADMIN_API_BASE)