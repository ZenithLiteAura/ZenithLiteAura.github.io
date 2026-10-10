import { handleCapApi } from '../src/verify/cap-api'
import { isCapApiPath } from '../src/verify/cap-shared'
import type { CapEnv } from '../src/verify/cap-shared'

interface Env extends CapEnv {
  /** 由 wrangler.jsonc 的 assets binding 注入的可选静态资源句柄。 */
  ASSETS?: { fetch(request: Request): Promise<Response> }
}

/**
 * Cloudflare Worker 入口。
 *
 * 静态资源仍由 Cloudflare 的资源路由直接命中；只有未命中资源、且属于 Cap API 的请求
 * 才会进到这里。未命中资源又不属于 API 的路径返回 404。
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (isCapApiPath(pathname)) {
      return handleCapApi(request, env)
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }

    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  },
}