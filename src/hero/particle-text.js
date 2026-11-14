/**
 * particle-text.js — 点阵文字（canvas 粒子）
 *
 * 算法移植自 mimo-hero-clone/js/particle-text.js（即原站 mimo.mi.com 的 eZ() 实现），
 * 常数保持原样；改动的只有三处：
 *   1. 改为 ESM + 可配置对象（不再挂 window）
 *   2. 颜色从站点的 CSS 变量读，并做对比度校验
 *   3. 加 IntersectionObserver / visibilitychange 暂停，以及两行兜底
 */

export const DEFAULT_CONFIG = {
  text: 'ZenithLiteAura',
  /** null = 读 CSS 变量 --dot-a / --dot-c，并在两者之间生成中间色 */
  colors: null,
  /** null = 读 --font-display，再回退到衬线栈 */
  fontFamily: null,
  fontWeight: 400,
  dotSize: 1.8,
  minDots: 900,
  maxDots: 5200,
  dpsDivisor: 90,
  repelRadius: 120,
  repelForce: 40,
  damping: 0.55,
  enterDuration: 1600,
  enterStagger: 420,
  sampleStep: 2,
  alphaCutoff: 40,
  pointerEase: 0.18,
  /** 接收指针事件的元素；null = host 的父元素（host 本身 pointer-events:none） */
  pointerTarget: null,
  /** 单行字号小于这个值就改两行：再小点阵化会糊成一团 */
  twoLineBelow: 72,
  /** 对比度下限（点阵属于大字号，AA 大文本是 3:1） */
  minContrast: 3,
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ------------------------------ 颜色工具 ------------------------------ */

function parseColor(value) {
  const v = String(value || '').trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/(.)/g, '$1$1') : hex[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  const rgb = v.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const p = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0] || 0, g: p[1] || 0, b: p[2] || 0 };
  }
  return null;
}

const mix = (a, b, t) => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
});

const css = (c) => `rgb(${c.r},${c.g},${c.b})`;

function luminance({ r, g, b }) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** 不达标就朝黑/白推 10%，最多推 10 次；返回 { color, ratio } */
function ensureContrast(color, bg, min) {
  let c = { ...color };
  let ratio = contrast(c, bg);
  const towardWhite = luminance(bg) < 0.4;
  for (let i = 0; i < 10 && ratio < min; i += 1) {
    c = towardWhite ? mix(c, { r: 255, g: 255, b: 255 }, 0.1) : mix(c, { r: 0, g: 0, b: 0 }, 0.1);
    ratio = contrast(c, bg);
  }
  return { color: c, ratio };
}

/* ------------------------------ 主体 ------------------------------ */

export function createParticleText(host, options = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...options };
  const canvas = host.querySelector('canvas');
  if (!canvas) throw new Error('createParticleText: host 里需要一个 <canvas>');
  const ctx = canvas.getContext('2d');
  // host(.hero-dots) 是 pointer-events:none，事件要挂在 Hero 容器上
  const pointerTarget = cfg.pointerTarget || host.parentElement || host;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedQuery.matches;

  let dots = [];
  let palette = { stops: [], bg: { r: 245, g: 241, b: 233 }, ratios: [] };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = null;
  let entering = false;
  let startTime = 0;
  let lastTs = 0;
  let visible = true;
  let inViewport = true;
  const pointer = { active: false, x: 0, y: 0, sx: 0, sy: 0, pointerId: null };
  let layoutTimer = null;

  const stats = { dotCount: 0, fontSize: 0, twoLine: false, loops: 0, pointerActive: false };

  /* ---------- 读站点配色 ---------- */
  function readPalette() {
    const rootStyle = getComputedStyle(document.documentElement);
    const hostStyle = getComputedStyle(host);
    const pick = (name, fallback) => {
      const fromHost = hostStyle.getPropertyValue(name).trim();
      const fromRoot = rootStyle.getPropertyValue(name).trim();
      return parseColor(fromHost) || parseColor(fromRoot) || parseColor(fallback);
    };

    const bg = pick('--bg', '#F5F1E9');
    const a = pick('--dot-a', '') || pick('--ink', '#221E18');
    const c = pick('--dot-c', '') || pick('--accent', '#C14A11');

    // 每次都从 CSS 变量重算原始色。
    // 注意不能复用 palette.stops：它已经是 {color, ratio} 包装，二次 layout 会再包一层变成 NaN。
    const raw = Array.isArray(cfg.colors) && cfg.colors.length >= 2
      ? cfg.colors.map((x) => parseColor(x)).filter(Boolean)
      : [a, mix(a, c, 0.55), c];
    palette.raw = raw;
    palette.stops = raw.map((stop) => ensureContrast(stop, bg, cfg.minContrast));
    palette.bg = bg;
    palette.ratios = palette.stops.map((s) => Number(s.ratio.toFixed(2)));
    palette.cssStops = palette.stops.map((s) => css(s.color));
  }

  /** 多段插值：t∈[0,1] 映射到 stops 之间 */
  function colorAt(t) {
    const n = palette.cssStops.length;
    if (n === 1) return palette.cssStops[0];
    const scaled = clamp(t, 0, 1) * (n - 1);
    const i = Math.min(n - 2, Math.floor(scaled));
    const local = scaled - i;
    const a = palette.stops[i].color;
    const b = palette.stops[i + 1].color;
    return css(mix(a, b, local));
  }

  function recolor() {
    for (const d of dots) d.color = colorAt(d.t);
  }

  /* ---------- 布局：测字号 → 栅格化 → 采样 → 抽稀 ---------- */
  function layout() {
    const rect = host.getBoundingClientRect();
    width = Math.floor(rect.width);
    height = Math.floor(rect.height);
    if (width <= 0 || height <= 0) return;

    readPalette();

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const family =
      cfg.fontFamily ||
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
      'Georgia, "Times New Roman", "Songti SC", serif';

    // 1) 用 "M" 量响应式字号
    const probe = document.createElement('span');
    probe.textContent = 'M';
    probe.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap;' +
      `font-size:clamp(6rem,18vw,14rem);font-weight:${cfg.fontWeight};font-family:${family}`;
    host.appendChild(probe);
    let fontSize = parseFloat(getComputedStyle(probe).fontSize) || 96;
    probe.remove();

    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    const maxWidth = 0.92 * width;
    const fit = (size, lines) => {
      offCtx.font = `${cfg.fontWeight} ${size}px ${family}`;
      const widths = lines.map((l) => offCtx.measureText(l).width);
      return Math.max(1, ...widths);
    };

    let lines = [cfg.text];
    let widest = fit(fontSize, lines);
    if (widest > maxWidth) {
      fontSize = Math.max(12, (maxWidth / widest) * fontSize);
      // 缩放后必须重测：否则 blockW 用的是缩放前的宽度，
      // 居中偏移会把文字推出画布左侧（表现为开头字母被裁掉）
      widest = fit(fontSize, lines);
    }

    // 2) 字号太小就分两行，别硬挤一行（点阵化后会糊成一团）
    if (fontSize < cfg.twoLineBelow && cfg.text.length > 8) {
      // 按 CamelCase 边界切，取最均衡的那个（Zenith / LiteAura），别从中间劈开
      const caps = [];
      for (let i = 1; i < cfg.text.length; i += 1) {
        const ch = cfg.text[i];
        if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) caps.push(i);
      }
      const mid = caps.length
        ? caps.reduce((best, i) =>
            Math.abs(i - (cfg.text.length - i)) < Math.abs(best - (cfg.text.length - best)) ? i : best,
          caps[0])
        : Math.ceil(cfg.text.length / 2);
      lines = [cfg.text.slice(0, mid), cfg.text.slice(mid)];
      const twoWidest = fit(fontSize, lines);
      fontSize = Math.max(12, (maxWidth / twoWidest) * fontSize);
      // 两行等于高度翻倍，再按容器可用高度限一次，避免上下被裁
      const maxBlockH = height * 0.94;
      const needed = lines.length * fontSize * 1.06;
      if (needed > maxBlockH) fontSize = Math.max(12, maxBlockH / (lines.length * 1.06));
      widest = fit(fontSize, lines);
    }

    const font = `${cfg.fontWeight} ${fontSize}px ${family}`;
    offCtx.font = font;
    const lineHeight = fontSize * 1.06;
    const metrics = offCtx.measureText(cfg.text);
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent || 0.78 * fontSize);
    const descent = Math.ceil(metrics.actualBoundingBoxDescent || 0.22 * fontSize);
    const pad = Math.max(12, Math.ceil(0.08 * fontSize));
    const blockW = Math.ceil(widest);
    const blockH = Math.ceil((lines.length - 1) * lineHeight + ascent + descent);

    off.width = blockW + 2 * pad;
    off.height = blockH + 2 * pad;
    offCtx.clearRect(0, 0, off.width, off.height);
    offCtx.font = font;
    offCtx.textAlign = 'left';
    offCtx.textBaseline = 'alphabetic';
    offCtx.fillStyle = '#fff';
    lines.forEach((line, i) => {
      offCtx.fillText(line, pad, pad + ascent + i * lineHeight);
    });

    // 3) 逐像素采样
    const data = offCtx.getImageData(0, 0, off.width, off.height).data;
    const samples = [];
    const ox = width / 2 - off.width / 2;
    const oy = height / 2 - off.height / 2;
    for (let y = 0; y < off.height; y += cfg.sampleStep) {
      for (let x = 0; x < off.width; x += cfg.sampleStep) {
        if (data[(y * off.width + x) * 4 + 3] > cfg.alphaCutoff) {
          samples.push({ x: ox + x, y: oy + y });
        }
      }
    }

    // 4) 抽稀到目标点数
    const target = clamp(Math.floor((width * height) / cfg.dpsDivisor), cfg.minDots, cfg.maxDots);
    const stride = Math.max(1, Math.ceil(samples.length / target));
    dots = samples
      .filter((_, i) => i % stride === 0)
      .map((s, i) => {
        const seed = ((9301 * i + 49297) % 233280) / 233280;
        const depth = 0.45 + ((((233 * i + 97) % 1000) / 1000) * 0.9);
        const t = clamp(s.x / Math.max(1, width) + (seed - 0.5) * 0.35, 0, 1);
        return {
          tx: s.x,
          ty: s.y,
          x: s.x,
          y: s.y,
          sx: s.x,
          sy: s.y,
          t,
          seed,
          depth,
          delay: cfg.enterStagger * seed,
          color: colorAt(t),
        };
      });

    stats.dotCount = dots.length;
    stats.fontSize = Math.round(fontSize);
    stats.twoLine = lines.length > 1;
    stats.colors = palette.cssStops;
    stats.contrast = palette.ratios;
    stats.fontFamily = family;

    pointer.x = width / 2;
    pointer.y = height / 2;
    pointer.sx = pointer.x;
    pointer.sy = pointer.y;
    pointer.active = false;

    startEntrance();
  }

  function startEntrance() {
    for (const d of dots) {
      const angle = d.seed * Math.PI * 2;
      const radius = 180 * (0.35 + 0.75 * d.depth);
      d.sx = d.tx + Math.cos(angle) * radius + (d.seed - 0.5) * 81;
      d.sy = d.ty + Math.sin(angle) * radius + (d.depth - 0.9) * 81;
      d.x = d.sx;
      d.y = d.sy;
    }
    startTime = performance.now();
    entering = !reduced;
    if (reduced) {
      for (const d of dots) {
        d.x = d.tx;
        d.y = d.ty;
      }
      drawFrame(0);
      return;
    }
    startLoop();
  }

  /* ---------- 逐帧 ---------- */
  function drawFrame(ts) {
    ctx.clearRect(0, 0, width, height);
    pointer.sx += (pointer.x - pointer.sx) * cfg.pointerEase;
    pointer.sy += (pointer.y - pointer.sy) * cfg.pointerEase;

    let allDone = true;
    const time = 0.001 * ts;

    for (const d of dots) {
      let nx = d.tx;
      let ny = d.ty;
      let progress = 1;

      if (entering) {
        progress = clamp((ts - startTime - d.delay) / cfg.enterDuration, 0, 1);
        const e = easeOutCubic(progress);
        nx = d.sx + (d.tx - d.sx) * e;
        ny = d.sy + (d.ty - d.sy) * e;
        if (progress < 1) allDone = false;
      } else if (!reduced) {
        nx += 0.15 * Math.sin(0.9 * time + 10 * d.seed) * d.depth;
        ny += 0.15 * Math.cos(0.75 * time + 10 * d.depth) * d.depth;
      }

      if (pointer.active) {
        const dx = d.x - pointer.sx;
        const dy = d.y - pointer.sy;
        const dist = Math.hypot(dx, dy);
        if (dist < cfg.repelRadius && dist > 0.1) {
          const force = (1 - dist / cfg.repelRadius) * cfg.repelForce;
          nx += (dx / dist) * force;
          ny += (dy / dist) * force;
        }
      }

      d.x += (nx - d.x) * cfg.damping;
      d.y += (ny - d.y) * cfg.damping;

      ctx.globalAlpha = clamp(0.35 + 0.65 * progress, 0, 1);
      ctx.fillStyle = d.color;
      if (cfg.dotSize <= 2.1) {
        ctx.fillRect(d.x - cfg.dotSize / 2, d.y - cfg.dotSize / 2, cfg.dotSize, cfg.dotSize);
      } else {
        ctx.beginPath();
        ctx.arc(d.x, d.y, cfg.dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (entering && allDone) entering = false;
  }

  function loop(ts) {
    lastTs = ts;
    drawFrame(ts);
    stats.loops += 1;
    frameId = requestAnimationFrame(loop);
  }
  const running = () => frameId !== null;
  function startLoop() {
    if (running() || !visible || !inViewport || reduced) return;
    frameId = requestAnimationFrame(loop);
  }
  function stopLoop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  /* ---------- 指针 ---------- */
  const setFromEvent = (e) => {
    const rect = host.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  };
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    setFromEvent(e);
    pointer.active = true;
    stats.pointerActive = true;
    if (!running() && !reduced) startLoop();
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.active = false;
    stats.pointerActive = false;
  };

  // host 本身 pointer-events:none，指针事件挂在它外面的 Hero 容器上
  pointerTarget.addEventListener('pointermove', onPointerMove);
  pointerTarget.addEventListener('pointerleave', onPointerLeave);

  /* ---------- 可见性 / 尺寸 ---------- */
  function scheduleLayout() {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(() => {
      const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      ready.then(() => layout());
    }, 120);
  }

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(scheduleLayout);
    ro.observe(host);
  }
  const onVisibility = () => {
    visible = !document.hidden;
    if (visible) startLoop();
    else stopLoop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  let io = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        inViewport = entries.some((e) => e.isIntersecting);
        if (inViewport) startLoop();
        else stopLoop();
      },
      { threshold: 0.05 },
    );
    io.observe(host);
  }

  const onReducedChange = () => {
    reduced = reducedQuery.matches;
    if (reduced) {
      stopLoop();
      for (const d of dots) {
        d.x = d.tx;
        d.y = d.ty;
      }
      drawFrame(0);
    } else {
      startEntrance();
    }
  };
  if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', onReducedChange);

  // 主题切换（html[data-theme]）后重新取色，不动点位置
  const themeObserver = new MutationObserver(() => {
    readPalette();
    recolor();
    // 仅换色时 stats 也要跟着更新，否则外部读到的是上一次主题的值
    stats.colors = palette.cssStops;
    stats.contrast = palette.ratios;
    if (reduced) drawFrame(0);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => layout());
  } else {
    layout();
  }

  return {
    destroy() {
      stopLoop();
      clearTimeout(layoutTimer);
      ro && ro.disconnect();
      io && io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      pointerTarget.removeEventListener('pointermove', onPointerMove);
      pointerTarget.removeEventListener('pointerleave', onPointerLeave);
      if (reducedQuery.removeEventListener) reducedQuery.removeEventListener('change', onReducedChange);
    },
    relayout: scheduleLayout,
    stats,
    get lastTs() {
      return lastTs;
    },
  };
}