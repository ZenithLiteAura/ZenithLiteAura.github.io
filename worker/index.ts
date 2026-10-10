import { handleAdminApi } from '../src/admin/admin-api'
import { isAdminApiPath } from '../src/admin/admin-shared'
import { handleCapApi } from '../src/verify/cap-api'
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

    if (isCapApiPath(pathname)) {
      return handleCapApi(request, env)
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }

    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  },
}