/**
 * cursor.js — 自定义光标
 * 移植自 mimo-hero-clone/js/cursor.js（原站 tf() 组件）。
 * 与参考实现一致：两个 fixed div，直接写 left/top（无缓动、无 rAF）；
 * 悬停文字/按钮时圆环放大到 80px；触屏不创建。
 *
 * 颜色不写死：圆环取 --ink-2，圆点取 --ink，随主题变量变化。
 */

const TEXT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,li,blockquote,a:not(button):not([class*="btn"])';
const BUTTON_SELECTOR = 'button,[class*="btn"]';

export function initCustomCursor(options = {}) {
  const cfg = {
    ringId: 'cursorRing',
    dotId: 'cursorDot',
    hideNativeWithin: '[data-cursor-zone]',
    ...options,
  };

  // 触屏设备不做自定义光标
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return { destroy() {} };

  const ring = document.getElementById(cfg.ringId);
  const dot = document.getElementById(cfg.dotId);
  if (!ring || !dot) return { destroy() {} };

  const zones = [...document.querySelectorAll(cfg.hideNativeWithin)];
  zones.forEach((z) => z.classList.add('has-custom-cursor'));

  let visible = false;

  const place = (x, y) => {
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
  };

  const show = (x, y) => {
    place(x, y);
    if (visible) return;
    visible = true;
    ring.style.opacity = '1';
    dot.style.opacity = '1';
  };

  const hide = () => {
    visible = false;
    ring.style.opacity = '0';
    dot.style.opacity = '0';
  };

  const onMove = (e) => show(e.clientX, e.clientY);
  const onEnter = (e) => show(e.clientX, e.clientY);
  const onLeave = () => hide();

  const syncState = (target) => {
    const el = target && target.closest ? target.closest(`${BUTTON_SELECTOR}, ${TEXT_SELECTOR}`) : null;
    ring.classList.remove('cursor-text', 'cursor-button');
    if (!el) return;
    if (el.matches(BUTTON_SELECTOR)) ring.classList.add('cursor-button');
    else ring.classList.add('cursor-text');
  };
  const onOver = (e) => syncState(e.target);
  const onFocus = (e) => syncState(e.target);

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseenter', onEnter);
  document.addEventListener('mouseleave', onLeave);
  document.addEventListener('mouseover', onOver);
  document.addEventListener('focusin', onFocus);

  return {
    destroy() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('focusin', onFocus);
      zones.forEach((z) => z.classList.remove('has-custom-cursor'));
    },
  };
}