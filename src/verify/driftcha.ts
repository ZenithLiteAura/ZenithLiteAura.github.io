import { DEFAULT_MESSAGES, DEFAULT_STAGES, createDriftcha } from 'driftcha'
import type { Driftcha, DriftchaMessages, Stage } from 'driftcha'
import { resolveDark, state } from '../store'
import type { Lang } from '../types'

/**
 * Driftcha 的 UI 文案默认是英文，中文在这里覆盖。
 * `stages[].description` 会被填进 `prompt` 模板里，所以它也必须跟着翻译。
 */
const ZH_MESSAGES: Partial<DriftchaMessages> = {
  title: '确认你是人类',
  subtitle: '读出在噪点中漂移的数字',
  progressLabel: '验证进度',
  canvasLabel: '动态噪点，数字只在运动时可见',
  inputLabel: '你看到的数字',
  zoomIn: '放大',
  zoomOut: '退出放大',
  verify: '验证',
  reload: '换一个',
  busy: '校验中…',
  passed: '✓ 通过',
  failed: '失败',
  loading: '正在生成挑战…',
  prompt: '输入在{description}噪点里漂移的 {length} 位数字。',
  pressVerify: '按「验证」（或再按一次回车）提交。',
  needDigits: '请逐位输入全部 {length} 位数字。',
  typingRejected: '看起来不是手输的。清空输入框，再逐位输入一次。',
  wrong: '不对，已换一个新验证码。',
  stagePassed: '第 {done} 关通过，接下来是{description}关。',
  clickRejected: '点击校验未通过，请再点一次。',
  tooFast: '有点太快了，再看一眼后按「验证」。',
  success: '验证通过，你（大概率）是人类。',
  expired: '验证码已过期，已换一个新的。',
  timedOut: '本次验证码超时，点「换一个」获取新的。',
  networkError: '网络异常，请稍后重试。',
  oneAtATime: '请逐位输入。',
  noPaste: '请逐位输入，粘贴与拖放已禁用。',
  noAutocorrect: '请关闭自动更正后逐位输入。',
  plainDigits: '请把键盘切到纯数字后逐位输入。',
  doneTitle: '验证通过',
  doneBody: '全部 {count} 关均通过。',
  restart: '再来一次',
  errorTitle: '连不上服务端',
  errorBody: '验证服务器没有响应。',
  retry: '重试',
}

/** 舞台的 label/description 是给人看的，中文下要跟着换。 */
function stagesFor(lang: Lang): readonly Stage[] {
  if (lang === 'en') return DEFAULT_STAGES
  return DEFAULT_STAGES.map((stage) => {
    const label = stage.id === 'color' ? '彩色' : '黑白'
    return { ...stage, label, description: label }
  })
}

/** 挂载 Driftcha（浏览器模式：不传 backend，用默认的 createLocalBackend）。 */
export function mountDriftcha(host: HTMLElement): Driftcha {
  return createDriftcha(host, {
    theme: resolveDark(state.theme) ? 'dark' : 'light',
    messages: state.lang === 'zh' ? ZH_MESSAGES : {},
    stages: stagesFor(state.lang),
  })
}

export { DEFAULT_MESSAGES }