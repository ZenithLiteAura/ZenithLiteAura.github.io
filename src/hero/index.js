/**
 * index.js — Hero 点阵文字 + 自定义光标的挂载入口
 *
 * 挂载位置：首页 index.html 的 .hero-dots 容器（内含一个 <canvas> 和一个视觉隐藏的 h1）。
 * 参数见 src/hero/particle-text.js 的 DEFAULT_CONFIG。
 */
import './hero.css';
import { createParticleText } from './particle-text.js';
import { initCustomCursor } from './cursor.js';

function mount() {
  const host = document.querySelector('.hero-dots');
  if (!host) return;

  const effect = createParticleText(host, {
    text: 'ZenithLiteAura',
    maxDots: 5200,
    dotSize: 1.8,
    repelRadius: 120,
    repelForce: 40,
    damping: 0.55,
    enterDuration: 1600,
  });

  initCustomCursor();

  // 供自测/调试读数据（不影响渲染）
  window.__heroDots = effect;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}