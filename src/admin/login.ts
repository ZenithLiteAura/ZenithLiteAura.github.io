import type { CapWidget } from 'cap-widget'
import { ADMIN_API_BASE } from './admin-shared'
import { h } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'

/**
 * 登录表单。
 *
 * 验证码用 Cap 的**浮动模式**：`<cap-widget>` 平时不占位（脚本会把它 display:none），
 * 点「登录」时它从按钮上方弹入并立刻开始解题，解完把 token 写到按钮的 data-cap-token，
 * 再自动重新点一次按钮 —— 这次才真正触发 submit。
 */

interface LoginErrorBody {
  error?: string
  retryAfter?: number
  missing?: string[]
  message?: string
}

function createWidget(): CapWidget {
  const widget = document.createElement('cap-widget')
  widget.id = 'admin-cap'
  widget.setAttribute('data-cap-api-endpoint', `${ADMIN_API_BASE}cap/`)
  // widget 内置 zh-cn / zh-tw 翻译
  widget.setAttribute('data-cap-lang', state.lang === 'zh' ? 'zh-cn' : 'en')
  return widget
}

export function renderLogin(onSuccess: (expiresAt: number | null) => void): HTMLElement {
  const d = dict(state.lang)
  const widget = createWidget()

  const status = h('p', { class: 'admin-status', role: 'status' })
  const password = h('input', {
    type: 'password',
    id: 'admin-password',
    class: 'admin-input',
    autocomplete: 'current-password',
    placeholder: d['admin.passwordPlaceholder'],
    'aria-label': d['admin.password'],
  })
  const submit = h('button', {
    type: 'submit',
    class: 'btn btn--primary admin-submit',
    'data-cap-floating': '#admin-cap',
    'data-cap-floating-position': 'top',
    text: d['admin.signIn'],
  })

  const form = h('form', { class: 'admin-form', novalidate: true }, [
    h('label', { class: 'admin-label', for: 'admin-password', text: d['admin.password'] }),
    password,
    widget,
    submit,
    status,
  ])

  const setStatus = (text: string, kind: 'info' | 'error' = 'info'): void => {
    status.textContent = text
    status.setAttribute('data-kind', kind)
  }

  /** 凭证已被服务端消耗，必须让用户重新解一次。 */
  const resetCaptcha = (): void => {
    submit.removeAttribute('data-cap-token')
    submit.removeAttribute('data-cap-pending')
    widget.reset()
  }

  const handleSubmit = async (): Promise<void> => {
    const token = widget.token ?? submit.getAttribute('data-cap-token') ?? ''

    if (!token) {
      // 在密码框直接回车时浮动流程还没跑过：替他点一次触发按钮。
      // 只自动触发一次，避免浮动脚本没加载时无限循环。
      if (submit.getAttribute('data-cap-pending') === '1') {
        setStatus(d['admin.errorGeneric'], 'error')
        return
      }
      submit.setAttribute('data-cap-pending', '1')
      submit.click()
      return
    }

    submit.removeAttribute('data-cap-pending')
    submit.setAttribute('disabled', '')
    setStatus(d['admin.signingIn'])

    try {
      const response = await fetch(`${ADMIN_API_BASE}login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: password.value, capToken: token }),
      })
      const data = (await response.json().catch(() => null)) as (LoginErrorBody & { ok?: boolean; expiresAt?: number }) | null

      if (response.ok && data?.ok) {
        onSuccess(data.expiresAt ?? null)
        return
      }

      if (response.status === 429) {
        const minutes = Math.max(1, Math.round((data?.retryAfter ?? 900) / 60))
        setStatus(d['admin.errorRateLimited'].replace('{minutes}', String(minutes)), 'error')
      } else if (response.status === 503) {
        setStatus(
          d['admin.errorNotConfigured'].replace('{missing}', (data?.missing ?? []).join('、')),
          'error',
        )
      } else {
        // 服务端故意不区分是密码错还是验证码错
        setStatus(d['admin.errorGeneric'], 'error')
      }
      password.select()
    } catch {
      setStatus(d['admin.errorNoBackend'], 'error')
    } finally {
      submit.removeAttribute('disabled')
      resetCaptcha()
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    void handleSubmit()
  })

  return form
}