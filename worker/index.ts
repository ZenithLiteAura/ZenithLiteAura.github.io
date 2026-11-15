import { handleAdminApi } from '../src/admin/admin-api'
import { isAdminApiPath } from '../src/admin/admin-shared'
import { handlePublicContent } from '../src/content/content-api'
import { isPublicContentPath } from '../src/content/content-shared'
import { handleCapApi } from '../src/verify/cap-api'
import { BEACON_PATH, handleBeacon } from '../src/verify/beacon-api'
import { isCapApiPath } from '../src/verify/cap-shared'
import type { ServerEnv } from '../src/server-shared'

interface Env extends ServerEnv {
  /** 由 wrangler.jsonc 的 assets binding 注入的可选静态资源句柄。 */
  ASSETS?: { fetch(request: Request): Promise<Response> }
}

/**
 * Cloudflare Worker 入口。
 *
 * 静态资源仍由 Cloudflare 的资源路由直接命中；只有未命中资源、且属于 API 的请求
 * 才会进到这里。未命中资源又不属于 API 的路径返回 404。
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (isAdminApiPath(pathname)) {
      return handleAdminApi(request, env)
    }

    // 公开的内容覆盖（无需登录）：页面启动时拉这个
    if (isPublicContentPath(pathname)) {
      return handlePublicContent(env)
    }

    // 验证页信标：只回服务端时间，用来在页面上算真实往返
    if (pathname === BEACON_PATH) {
      return handleBeacon(request)
    }

    if (isCapApiPath(pathname)) {
      return handleCapApi(request, env)
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }

    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  },
}