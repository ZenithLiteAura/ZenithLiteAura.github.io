import type { CapWidget } from 'cap-widget'
import { ADMIN_API_BASE } from './admin-shared'
import { h } from '../dom'
import { dict } from '../i18n'
import { state } from '../store'

/**
 * 登录表单：用户名 + 密码 + **内联** Cap 验证码。
 *
 * 验证码就是表单里一个常驻的框，要自己点掉；不弹浮层、也不自动提交。
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
  const username = h('input', {
    type: 'text',
    id: 'admin-username',
    class: 'admin-input',
    autocomplete: 'username',
    placeholder: d['admin.usernamePlaceholder'],
    'aria-label': d['admin.username'],
    spellcheck: 'false',
  })
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
    text: d['admin.signIn'],
  })

  const form = h('form', { class: 'admin-form', novalidate: true }, [
    h('label', { class: 'admin-label', for: 'admin-username', text: d['admin.username'] }),
    username,
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

  const handleSubmit = async (): Promise<void> => {
    // 内联模式下验证码要用户自己点，没解就直接提交会拿不到 token
    const token = widget.token ?? ''
    if (!token) {
      setStatus(d['admin.errorCaptchaRequired'], 'error')
      return
    }

    submit.setAttribute('disabled', '')
    setStatus(d['admin.signingIn'])

    try {
      const response = await fetch(`${ADMIN_API_BASE}login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value, capToken: token }),
      })
      const data = (await response.json().catch(() => null)) as
        | (LoginErrorBody & { ok?: boolean; expiresAt?: number })
        | null

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
        // 服务端故意不区分是用户名错、密码错还是验证码错
        setStatus(d['admin.errorGeneric'], 'error')
      }
      password.select()
    } catch {
      setStatus(d['admin.errorNoBackend'], 'error')
    } finally {
      submit.removeAttribute('disabled')
      // 凭证已被服务端消耗（或本次失败），必须重新解一次
      widget.reset()
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    void handleSubmit()
  })

  return form
}