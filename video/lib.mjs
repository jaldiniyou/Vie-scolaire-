// Drawing primitives, easing, characters and props for the TutinGo explainer.
// Everything is vector (canvas 2D) so the video renders deterministically, frame by frame.

export const W = 1080;
export const H = 1920;

// ---------------------------------------------------------------------------
// Brand — purples sampled from the TutinGo logo (assets/logo.png); the other
// colours are supporting accents.
// ---------------------------------------------------------------------------
export const BRAND = {
  primary: '#6530DC',
  primaryDark: '#4A1FB0',
  accent: '#FF8A3D',
  teal: '#14B8A6',
  yellow: '#FFC93C',
  pink: '#FF6B8B',
  ink: '#1E1B4B',
  muted: '#6B6894',
  cream: '#FFF8F0',
  lavender: '#F1ECFF',
  white: '#FFFFFF',
};

export const FONT = 'Inter';

// ---------------------------------------------------------------------------
// Timing helpers
// ---------------------------------------------------------------------------
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
export const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOutBack = (p) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};
export const easeOutElastic = (p) => {
  if (p === 0 || p === 1) return p;
  return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};
// progress of an animation that starts at `start` and lasts `dur`
export const prog = (t, start, dur = 0.5, ease = easeOutCubic) => ease(clamp((t - start) / dur));
// in → hold → out envelope
export const window_ = (t, a, b, fade = 0.3) => clamp(Math.min((t - a) / fade, (b - t) / fade));

// ---------------------------------------------------------------------------
// Basic shapes
// ---------------------------------------------------------------------------
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function fillRR(ctx, x, y, w, h, r, fill, shadow) {
  ctx.save();
  if (shadow) {
    // canvas shadows ignore globalAlpha, so fold it into the shadow colour
    const m = (shadow.color || 'rgba(30,27,75,0.18)').match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    ctx.shadowColor = m ? `rgba(${m[1]},${m[2]},${m[3]},${m[4] * ctx.globalAlpha})` : shadow.color;
    ctx.shadowBlur = shadow.blur ?? 30;
    ctx.shadowOffsetY = shadow.y ?? 12;
  }
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, w, color, cap = 'round') {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.lineCap = cap;
  ctx.stroke();
}

export function withAlpha(ctx, a, fn) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  fn();
  ctx.restore();
}

// scale-in "pop" around a point
export function pop(ctx, t, start, x, y, fn, dur = 0.45) {
  const p = clamp((t - start) / dur);
  if (p <= 0) return;
  const s = easeOutBack(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(-x, -y);
  fn();
  ctx.restore();
}

// slide-up + fade
export function rise(ctx, t, start, fn, dist = 60, dur = 0.5) {
  const p = clamp((t - start) / dur);
  if (p <= 0) return;
  ctx.save();
  ctx.translate(0, (1 - easeOutCubic(p)) * dist);
  ctx.globalAlpha *= easeOutCubic(p);
  fn();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------
export function font(size, weight = 700) {
  return `${weight} ${size}px ${FONT}`;
}

export function text(ctx, str, x, y, { size = 48, weight = 700, color = BRAND.ink, align = 'center', baseline = 'middle' } = {}) {
  ctx.font = font(size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

export function measure(ctx, str, size, weight = 700) {
  ctx.font = font(size, weight);
  return ctx.measureText(str).width;
}

// A headline where words wrapped in *stars* get an animated marker highlight.
export function headline(ctx, t, start, str, y, { size = 76, color = BRAND.ink, mark = BRAND.yellow, markText, x = W / 2 } = {}) {
  const parts = str.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => ({ s: s.replace(/\*/g, ''), hl: s.startsWith('*') }));
  const widths = parts.map((p) => measure(ctx, p.s, size, 800));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = x - total / 2;
  const p = clamp((t - start) / 0.5);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= easeOutCubic(p);
  ctx.translate(0, (1 - easeOutCubic(p)) * 50);
  parts.forEach((part, i) => {
    if (part.hl) {
      const mp = prog(t, start + 0.25, 0.45, easeInOutCubic);
      fillRR(ctx, cx - 10, y - size * 0.55, (widths[i] + 20) * mp, size * 1.12, 18, mark);
    }
    text(ctx, part.s, cx, y + 2, { size, weight: 800, color: part.hl && markText ? markText : color, align: 'left' });
    cx += widths[i];
  });
  ctx.restore();
}

// rounded label pill, centred at x,y. icon(ctx, cx, cy, size, color) optional
export function pill(ctx, str, x, y, { size = 40, bg = BRAND.white, fg = BRAND.ink, icon, iconBg, padX = 34, h, shadow = true, weight = 700 } = {}) {
  const tw = measure(ctx, str, size, weight);
  const ph = h || size * 2.1;
  const iw = icon ? ph * 0.78 + 14 : 0;
  const pw = tw + padX * 2 + iw;
  const px = x - pw / 2, py = y - ph / 2;
  fillRR(ctx, px, py, pw, ph, ph / 2, bg, shadow ? { blur: 24, y: 10 } : null);
  if (icon) {
    const ir = ph * 0.39;
    circle(ctx, px + padX * 0.5 + ir, y, ir, iconBg || BRAND.lavender);
    icon(ctx, px + padX * 0.5 + ir, y, ir * 1.1, fg === BRAND.white ? BRAND.white : BRAND.primary);
  }
  text(ctx, str, px + padX + iw + tw / 2 - (icon ? padX * 0.25 : 0), y + 1, { size, weight, color: fg });
  return pw;
}

// ---------------------------------------------------------------------------
// Icons — drawn centred at (x,y), roughly fitting a box of `s`
// ---------------------------------------------------------------------------
export const icons = {
  check(ctx, x, y, s, c = BRAND.white) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.42, y + s * 0.02);
    ctx.lineTo(x - s * 0.12, y + s * 0.32);
    ctx.lineTo(x + s * 0.45, y - s * 0.3);
    ctx.lineWidth = s * 0.17;
    ctx.strokeStyle = c;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  },
  clock(ctx, x, y, s, c = BRAND.primary, t = 0) {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.45, 0, Math.PI * 2);
    ctx.lineWidth = s * 0.1;
    ctx.strokeStyle = c;
    ctx.stroke();
    line(ctx, x, y, x + Math.sin(t) * s * 0.3, y - Math.cos(t) * s * 0.3, s * 0.09, c);
    line(ctx, x, y, x + Math.sin(t / 12) * s * 0.2, y - Math.cos(t / 12) * s * 0.2, s * 0.09, c);
  },
  calendar(ctx, x, y, s, c = BRAND.primary) {
    ctx.lineWidth = s * 0.09;
    ctx.strokeStyle = c;
    rr(ctx, x - s * 0.42, y - s * 0.34, s * 0.84, s * 0.76, s * 0.12);
    ctx.stroke();
    line(ctx, x - s * 0.42, y - s * 0.1, x + s * 0.42, y - s * 0.1, s * 0.09, c);
    line(ctx, x - s * 0.2, y - s * 0.46, x - s * 0.2, y - s * 0.26, s * 0.09, c);
    line(ctx, x + s * 0.2, y - s * 0.46, x + s * 0.2, y - s * 0.26, s * 0.09, c);
    circle(ctx, x - s * 0.15, y + s * 0.13, s * 0.06, c);
    circle(ctx, x + s * 0.15, y + s * 0.13, s * 0.06, c);
  },
  pin(ctx, x, y, s, c = BRAND.primary) {
    ctx.beginPath();
    ctx.arc(x, y - s * 0.1, s * 0.32, Math.PI * 0.85, Math.PI * 0.15);
    ctx.lineTo(x, y + s * 0.48);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    circle(ctx, x, y - s * 0.1, s * 0.12, BRAND.white);
  },
  star(ctx, x, y, s, c = BRAND.yellow) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? s * 0.22 : s * 0.5;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  },
  search(ctx, x, y, s, c = BRAND.primary) {
    ctx.beginPath();
    ctx.arc(x - s * 0.08, y - s * 0.08, s * 0.28, 0, Math.PI * 2);
    ctx.lineWidth = s * 0.11;
    ctx.strokeStyle = c;
    ctx.stroke();
    line(ctx, x + s * 0.13, y + s * 0.13, x + s * 0.4, y + s * 0.4, s * 0.12, c);
  },
  user(ctx, x, y, s, c = BRAND.primary) {
    circle(ctx, x, y - s * 0.17, s * 0.2, c);
    ctx.beginPath();
    ctx.arc(x, y + s * 0.42, s * 0.36, Math.PI, 0);
    ctx.fillStyle = c;
    ctx.fill();
  },
  home(ctx, x, y, s, c = BRAND.primary) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y - s * 0.02);
    ctx.lineTo(x, y - s * 0.44);
    ctx.lineTo(x + s * 0.45, y - s * 0.02);
    ctx.lineWidth = s * 0.1;
    ctx.strokeStyle = c;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    rr(ctx, x - s * 0.3, y - s * 0.1, s * 0.6, s * 0.5, s * 0.06);
    ctx.fillStyle = c;
    ctx.fill();
    fillRR(ctx, x - s * 0.08, y + s * 0.12, s * 0.16, s * 0.28, s * 0.04, BRAND.white);
  },
  laptop(ctx, x, y, s, c = BRAND.primary) {
    ctx.lineWidth = s * 0.09;
    ctx.strokeStyle = c;
    rr(ctx, x - s * 0.34, y - s * 0.3, s * 0.68, s * 0.46, s * 0.06);
    ctx.stroke();
    fillRR(ctx, x - s * 0.48, y + s * 0.2, s * 0.96, s * 0.1, s * 0.05, c);
  },
  target(ctx, x, y, s, c = BRAND.primary) {
    [0.46, 0.3, 0.13].forEach((r, i) => circle(ctx, x, y, s * r, i % 2 ? BRAND.white : c));
  },
  chartUp(ctx, x, y, s, c = BRAND.primary) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.42, y + s * 0.3);
    ctx.lineTo(x - s * 0.12, y);
    ctx.lineTo(x + s * 0.05, y + s * 0.14);
    ctx.lineTo(x + s * 0.42, y - s * 0.28);
    ctx.lineWidth = s * 0.11;
    ctx.strokeStyle = c;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.46, y - s * 0.34);
    ctx.lineTo(x + s * 0.16, y - s * 0.32);
    ctx.lineTo(x + s * 0.44, y - s * 0.04);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  },
  briefcase(ctx, x, y, s, c = BRAND.primary) {
    ctx.lineWidth = s * 0.08;
    ctx.strokeStyle = c;
    rr(ctx, x - s * 0.14, y - s * 0.36, s * 0.28, s * 0.18, s * 0.05);
    ctx.stroke();
    fillRR(ctx, x - s * 0.44, y - s * 0.22, s * 0.88, s * 0.58, s * 0.08, c);
    line(ctx, x - s * 0.44, y + s * 0.02, x + s * 0.44, y + s * 0.02, s * 0.05, BRAND.white, 'butt');
  },
  cap(ctx, x, y, s, c = BRAND.primary) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y - s * 0.08);
    ctx.lineTo(x, y - s * 0.32);
    ctx.lineTo(x + s * 0.5, y - s * 0.08);
    ctx.lineTo(x, y + s * 0.16);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.28, y + s * 0.04);
    ctx.lineTo(x - s * 0.28, y + s * 0.26);
    ctx.quadraticCurveTo(x, y + s * 0.42, x + s * 0.28, y + s * 0.26);
    ctx.lineTo(x + s * 0.28, y + s * 0.04);
    ctx.lineTo(x, y + s * 0.18);
    ctx.closePath();
    ctx.fill();
    line(ctx, x + s * 0.42, y - s * 0.04, x + s * 0.42, y + s * 0.26, s * 0.05, c);
  },
  book(ctx, x, y, s, c = BRAND.primary) {
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.26);
    ctx.quadraticCurveTo(x - s * 0.22, y - s * 0.38, x - s * 0.46, y - s * 0.3);
    ctx.lineTo(x - s * 0.46, y + s * 0.32);
    ctx.quadraticCurveTo(x - s * 0.22, y + s * 0.24, x, y + s * 0.36);
    ctx.quadraticCurveTo(x + s * 0.22, y + s * 0.24, x + s * 0.46, y + s * 0.32);
    ctx.lineTo(x + s * 0.46, y - s * 0.3);
    ctx.quadraticCurveTo(x + s * 0.22, y - s * 0.38, x, y - s * 0.26);
    ctx.fillStyle = c;
    ctx.fill();
    line(ctx, x, y - s * 0.22, x, y + s * 0.3, s * 0.05, BRAND.white);
  },
  globe(ctx, x, y, s, c = BRAND.primary) {
    ctx.lineWidth = s * 0.08;
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.18, s * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, x - s * 0.42, y, x + s * 0.42, y, s * 0.08, c);
  },
  play(ctx, x, y, s, c = BRAND.white) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.2, y - s * 0.3);
    ctx.lineTo(x + s * 0.32, y);
    ctx.lineTo(x - s * 0.2, y + s * 0.3);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  },
  certificate(ctx, x, y, s, c = BRAND.primary) {
    fillRR(ctx, x - s * 0.44, y - s * 0.34, s * 0.88, s * 0.6, s * 0.06, c);
    line(ctx, x - s * 0.28, y - s * 0.16, x + s * 0.28, y - s * 0.16, s * 0.06, BRAND.white);
    line(ctx, x - s * 0.28, y - s * 0.02, x + s * 0.12, y - s * 0.02, s * 0.06, BRAND.white);
    circle(ctx, x + s * 0.22, y + s * 0.22, s * 0.16, BRAND.yellow);
  },
};

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------
export const SKIN = ['#F2C9A0', '#D9A273', '#B97A50', '#8D5A3B'];

// Head only, centred at (x,y), radius r. Used by full bodies and by the car window.
export function head(ctx, x, y, r, o = {}) {
  const { skin = SKIN[1], hair = '#2B1D16', style = 'short', mood = 0.6, blink = false, talk = 0, look = 0, lookY = 0, glasses = false, scarf = BRAND.teal, beard = false } = o;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.tilt || 0);
  // back hair / hijab
  if (style === 'long') {
    fillRR(ctx, -r * 1.05, -r * 0.6, r * 2.1, r * 2.1, r * 0.9, hair);
  } else if (style === 'hijab') {
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 1.22, r * 1.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = scarf;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 1.1, r * 0.4);
    ctx.quadraticCurveTo(0, r * 2.2, r * 1.1, r * 0.4);
    ctx.lineTo(r * 1.0, r * 1.6);
    ctx.lineTo(-r * 1.0, r * 1.6);
    ctx.closePath();
    ctx.fill();
  } else if (style === 'bun') {
    circle(ctx, 0, -r * 1.05, r * 0.42, hair);
  }
  // ears
  if (style !== 'hijab') {
    circle(ctx, -r * 0.95, r * 0.08, r * 0.2, skin);
    circle(ctx, r * 0.95, r * 0.08, r * 0.2, skin);
  }
  // face
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.95, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = skin;
  ctx.fill();
  // front hair
  ctx.fillStyle = hair;
  if (style === 'short' || style === 'bun' || style === 'long') {
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.42, r * 0.98, r * 0.62, 0, Math.PI, 0);
    ctx.fill();
    if (style === 'short') {
      ctx.beginPath();
      ctx.ellipse(-r * 0.25, -r * 0.5, r * 0.8, r * 0.38, -0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(r * 0.2, -r * 0.48, r * 0.85, r * 0.42, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'curly') {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      circle(ctx, Math.cos(a) * r * 0.82, -r * 0.25 + Math.sin(a) * r * 0.75, r * 0.34, hair);
    }
  } else if (style === 'hijab') {
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.62, r * 1.02, r * 0.52, 0, Math.PI, 0);
    ctx.fillStyle = scarf;
    ctx.fill();
  }
  if (beard) {
    ctx.beginPath();
    ctx.ellipse(0, r * 0.52, r * 0.7, r * 0.42, 0, 0, Math.PI);
    ctx.fillStyle = hair;
    ctx.globalAlpha *= 0.85;
    ctx.fill();
    ctx.globalAlpha /= 0.85;
  }
  // eyes
  const ex = r * 0.36, ey = r * 0.05 + lookY * r * 0.12, lx = look * r * 0.1;
  if (blink) {
    line(ctx, -ex - r * 0.1 + lx, ey, -ex + r * 0.1 + lx, ey, r * 0.07, '#231A3A');
    line(ctx, ex - r * 0.1 + lx, ey, ex + r * 0.1 + lx, ey, r * 0.07, '#231A3A');
  } else {
    circle(ctx, -ex + lx, ey, r * 0.1, '#231A3A');
    circle(ctx, ex + lx, ey, r * 0.1, '#231A3A');
    circle(ctx, -ex + lx + r * 0.03, ey - r * 0.03, r * 0.03, '#fff');
    circle(ctx, ex + lx + r * 0.03, ey - r * 0.03, r * 0.03, '#fff');
  }
  // brows: tilt with mood (worried brows when mood < 0)
  const bt = mood < 0 ? -mood * 0.35 : 0;
  ctx.save();
  ctx.translate(-ex, -r * 0.2);
  ctx.rotate(bt);
  line(ctx, -r * 0.14, 0, r * 0.14, 0, r * 0.07, '#2B1D16');
  ctx.restore();
  ctx.save();
  ctx.translate(ex, -r * 0.2);
  ctx.rotate(-bt);
  line(ctx, -r * 0.14, 0, r * 0.14, 0, r * 0.07, '#2B1D16');
  ctx.restore();
  if (glasses) {
    ctx.lineWidth = r * 0.06;
    ctx.strokeStyle = '#231A3A';
    ctx.beginPath();
    ctx.arc(-ex, ey, r * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, r * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, -ex + r * 0.22, ey, ex - r * 0.22, ey, r * 0.05, '#231A3A');
  }
  // nose
  ctx.beginPath();
  ctx.arc(lx * 0.6, r * 0.27 + lookY * r * 0.06, r * 0.09, Math.PI * 0.15, Math.PI * 0.85);
  ctx.lineWidth = r * 0.055;
  ctx.strokeStyle = 'rgba(90,40,30,0.45)';
  ctx.lineCap = 'round';
  ctx.stroke();
  // cheeks
  if (mood > 0.3) {
    withAlpha(ctx, 0.35, () => {
      circle(ctx, -r * 0.55, r * 0.35, r * 0.14, BRAND.pink);
      circle(ctx, r * 0.55, r * 0.35, r * 0.14, BRAND.pink);
    });
  }
  // mouth
  const my = r * 0.48;
  if (talk > 0.05) {
    ctx.beginPath();
    ctx.ellipse(0, my, r * 0.18, r * 0.06 + talk * r * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#7A2E3A';
    ctx.fill();
  } else {
    ctx.beginPath();
    const curve = mood * r * 0.22;
    ctx.moveTo(-r * 0.22, my - curve * 0.3);
    ctx.quadraticCurveTo(0, my + curve, r * 0.22, my - curve * 0.3);
    ctx.lineWidth = r * 0.07;
    ctx.strokeStyle = '#7A2E3A';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  ctx.restore();
}

export function shade(hex, k) {
  // k < 0 darkens, k > 0 lightens
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

// Two-segment arm/leg. `sd` is the side (-1 = screen left, +1 = screen right).
// a1: upper segment angle from straight down, positive = away from the body (outwards/up).
// a2: elbow bend relative to a1, negative = towards the body (inwards).
function limb(ctx, sd, x, y, a1, a2, l1, l2, w, color, handSkin) {
  const ex = x + sd * Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1;
  const hx = ex + sd * Math.sin(a1 + a2) * l2, hy = ey + Math.cos(a1 + a2) * l2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.lineTo(hx, hy);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  if (handSkin) {
    // cuff + hand
    circle(ctx, hx, hy, w * 0.52, handSkin);
    circle(ctx, hx + sd * w * 0.18, hy - w * 0.12, w * 0.24, handSkin);
  }
  return [hx, hy];
}

// Standard poses (sd-relative angles: [upper, elbow])
export const POSE = {
  rest: [0.1, -0.08],
  restOut: [0.22, -0.15],
  hip: [0.55, -2.2],          // hand on hip
  chest: [0.28, -2.25],       // hand in front of the chest (holding phone/book)
  wave: (t) => [2.55, 0.35 + Math.sin(t * 9) * 0.3],
  point: [2.0, 0.25],         // pointing up and out (to a board)
  present: [1.15, 0.45],      // open-palm "presenting" gesture
  type: [0.35, -1.75],        // forearm forward, hands on a desk/laptop
};

// Full body, front view. (x,y) = point between the feet (standing) or the seat (sitting).
// armL = arm on screen-left, armR = arm on screen-right, both as [a1, a2] (see limb()).
export function person(ctx, x, y, s, o = {}) {
  const {
    skin = SKIN[1], top = BRAND.primary, bottom = BRAND.ink, sitting = false,
    armL = POSE.rest, armR = POSE.rest, shoes = '#231A3A', tie = false, blazer = null, hold, holdR,
  } = o;
  const coat = blazer || top;
  const sleeve = shade(coat.startsWith('#') ? coat : '#4F46E5', -0.14);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const hipY = sitting ? 0 : -190;
  const shY = hipY - 190;
  // legs
  if (sitting) {
    // front view: short foreshortened thighs, shins straight down
    fillRR(ctx, -78, -30, 156, 70, 30, bottom);
    fillRR(ctx, -70, 20, 56, 150, 26, bottom);
    fillRR(ctx, 14, 20, 56, 150, 26, bottom);
    fillRR(ctx, -84, 152, 74, 30, 15, shoes);
    fillRR(ctx, 10, 152, 74, 30, 15, shoes);
  } else {
    const sw = o.walk ? Math.sin(o.walk) * 0.28 : 0;
    const legL = [-34 + Math.sin(sw) * 40, 0], legR = [34 - Math.sin(sw) * 40, 0];
    line(ctx, -34, hipY + 10, legL[0], -16, 58, bottom);
    line(ctx, 34, hipY + 10, legR[0], -16, 58, bottom);
    fillRR(ctx, legL[0] - 46, -26, 74, 30, 15, shoes);
    fillRR(ctx, legR[0] - 28, -26, 74, 30, 15, shoes);
  }
  // torso: shoulders wider than the waist
  ctx.beginPath();
  ctx.moveTo(-92, shY + 40);
  ctx.quadraticCurveTo(-92, shY, -50, shY);
  ctx.lineTo(50, shY);
  ctx.quadraticCurveTo(92, shY, 92, shY + 40);
  ctx.lineTo(80, hipY + 14);
  ctx.quadraticCurveTo(80, hipY + 26, 66, hipY + 26);
  ctx.lineTo(-66, hipY + 26);
  ctx.quadraticCurveTo(-80, hipY + 26, -80, hipY + 14);
  ctx.closePath();
  ctx.fillStyle = coat;
  ctx.fill();
  if (blazer) {
    ctx.beginPath();
    ctx.moveTo(-32, shY + 2);
    ctx.lineTo(0, shY + 96);
    ctx.lineTo(32, shY + 2);
    ctx.closePath();
    ctx.fillStyle = top;
    ctx.fill();
    line(ctx, 0, shY + 110, 0, hipY + 20, 3, shade(blazer, -0.25));
  } else if (o.headStyle !== 'hijab') {
    // round neckline
    ctx.beginPath();
    ctx.arc(0, shY + 2, 30, 0, Math.PI);
    ctx.fillStyle = shade(top.startsWith('#') ? top : '#4F46E5', -0.12);
    ctx.fill();
  }
  if (tie) {
    ctx.beginPath();
    ctx.moveTo(-10, shY + 10);
    ctx.lineTo(10, shY + 10);
    ctx.lineTo(16, shY + 110);
    ctx.lineTo(0, shY + 128);
    ctx.lineTo(-16, shY + 110);
    ctx.closePath();
    ctx.fillStyle = BRAND.accent;
    ctx.fill();
  }
  // neck
  if (o.headStyle !== 'hijab') fillRR(ctx, -22, shY - 34, 44, 44, 18, skin);
  // head first when an arm is raised, so a waving hand stays in front of the hair
  const drawHead = () => head(ctx, 0, shY - 92, 78, {
    skin, hair: o.hair, style: o.headStyle, mood: o.mood, blink: o.blink, talk: o.talk,
    look: o.look, lookY: o.lookY, glasses: o.glasses, scarf: o.scarf, beard: o.beard, tilt: o.tilt,
  });
  drawHead();
  // arms (sleeves a touch darker than the torso so they read against it)
  const hl = limb(ctx, -1, -80, shY + 30, armL[0], armL[1], 104, 98, 40, sleeve, skin);
  const hr = limb(ctx, 1, 80, shY + 30, armR[0], armR[1], 104, 98, 40, sleeve, skin);
  if (hold) hold(ctx, hl[0], hl[1]);
  if (holdR) holdR(ctx, hr[0], hr[1]);
  ctx.restore();
}

// natural blink every few seconds, offset per character
export const blinkAt = (t, seed = 0) => ((t + seed * 1.37) % 3.4) < 0.12;
// mouth movement while "talking"
export const talkAt = (t, on = true) => (on ? Math.max(0, Math.sin(t * 17) * 0.5 + Math.sin(t * 7.3) * 0.5) : 0);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export function laptop(ctx, x, y, w, screen, { open = 1, color = '#2E2A5C' } = {}) {
  // (x,y) = centre of the base front edge
  const sh = w * 0.62 * open;
  ctx.save();
  fillRR(ctx, x - w / 2, y - sh - 10, w, sh, 22, color, { blur: 40, y: 18 });
  const pad = w * 0.035;
  ctx.save();
  rr(ctx, x - w / 2 + pad, y - sh - 10 + pad, w - pad * 2, sh - pad * 2, 12);
  ctx.clip();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - w / 2, y - sh - 10, w, sh);
  if (screen && open > 0.6) {
    ctx.translate(x - w / 2 + pad, y - sh - 10 + pad);
    screen(ctx, w - pad * 2, sh - pad * 2);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - w * 0.08, y - 12);
  ctx.lineTo(x + w / 2 + w * 0.08, y - 12);
  ctx.lineTo(x + w / 2 + w * 0.03, y + 14);
  ctx.lineTo(x - w / 2 - w * 0.03, y + 14);
  ctx.closePath();
  ctx.fillStyle = '#C9C6E8';
  ctx.fill();
  ctx.restore();
}

// Laptop seen from behind (the person sitting behind it is looking at the screen).
export function laptopBack(ctx, x, y, w, { color = '#3A3470' } = {}) {
  const sh = w * 0.62;
  fillRR(ctx, x - w / 2, y - sh, w, sh, 20, color, { blur: 30, y: 12 });
  fillRR(ctx, x - w / 2 + 8, y - sh + 8, w - 16, sh - 16, 14, 'rgba(255,255,255,0.06)');
  icons.pin(ctx, x, y - sh / 2, w * 0.2, 'rgba(255,255,255,0.85)');
  fillRR(ctx, x - w * 0.56, y - 6, w * 1.12, 16, 8, '#C9C6E8');
}

export function phone(ctx, x, y, w, screen, { color = '#1F1B45', rot = 0 } = {}) {
  const h = w * 2.05;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  fillRR(ctx, -w / 2, -h / 2, w, h, w * 0.16, color, { blur: 40, y: 20 });
  const pad = w * 0.05;
  ctx.save();
  rr(ctx, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2, w * 0.12);
  ctx.clip();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  if (screen) {
    ctx.translate(-w / 2 + pad, -h / 2 + pad);
    screen(ctx, w - pad * 2, h - pad * 2);
  }
  ctx.restore();
  fillRR(ctx, -w * 0.14, -h / 2 + pad + 8, w * 0.28, w * 0.06, w * 0.03, color);
  ctx.restore();
}

export function desk(ctx, x, y, w, color = '#C98B5A') {
  fillRR(ctx, x - w / 2, y, w, 26, 10, color);
  fillRR(ctx, x - w / 2 + 30, y + 20, 22, 240, 8, '#A86E43');
  fillRR(ctx, x + w / 2 - 52, y + 20, 22, 240, 8, '#A86E43');
}

export function bookStack(ctx, x, y, s = 1) {
  const cs = [BRAND.accent, BRAND.teal, BRAND.primary];
  cs.forEach((c, i) => {
    fillRR(ctx, x - 70 * s + i * 6 * s, y - (i + 1) * 30 * s, 140 * s, 28 * s, 6 * s, c);
    fillRR(ctx, x - 58 * s + i * 6 * s, y - (i + 1) * 30 * s + 8 * s, 90 * s, 5 * s, 3, 'rgba(255,255,255,0.6)');
  });
}

export function plant(ctx, x, y, s = 1) {
  fillRR(ctx, x - 34 * s, y - 60 * s, 68 * s, 60 * s, 14 * s, BRAND.accent);
  [[-0.5, 0], [0, 1], [0.5, 2], [-0.2, 3], [0.25, 4]].forEach(([a]) => {
    ctx.save();
    ctx.translate(x, y - 60 * s);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -60 * s, 20 * s, 60 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2FA37A';
    ctx.fill();
    ctx.restore();
  });
}

// Moroccan arched window with a simple zellige-style 8-point star
export function archWindow(ctx, x, y, w, h, sky = '#BFE3FF') {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + h);
  ctx.lineTo(x - w / 2, y + w / 2);
  ctx.arc(x, y + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(x + w / 2, y + h);
  ctx.closePath();
  ctx.fillStyle = sky;
  ctx.fill();
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.clip();
  circle(ctx, x + w * 0.2, y + w * 0.45, w * 0.12, '#FFE8A3');
  ctx.restore();
}

export function zelligeStar(ctx, x, y, r, c, a = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.fillStyle = c;
  for (let k = 0; k < 2; k++) {
    ctx.save();
    ctx.rotate((k * Math.PI) / 4);
    ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
    ctx.restore();
  }
  ctx.restore();
}

export function speechBubble(ctx, x, y, w, h, fill = BRAND.white, tail = 'bl') {
  fillRR(ctx, x - w / 2, y - h / 2, w, h, Math.min(36, h / 2), fill, { blur: 26, y: 10 });
  ctx.beginPath();
  const tx = tail === 'bl' ? x - w * 0.25 : x + w * 0.25;
  ctx.moveTo(tx - 18, y + h / 2 - 2);
  ctx.lineTo(tx + (tail === 'bl' ? -26 : 26), y + h / 2 + 30);
  ctx.lineTo(tx + 18, y + h / 2 - 2);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function car(ctx, x, y, s, color, driver) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // cabin
  ctx.beginPath();
  ctx.moveTo(-110, -70);
  ctx.quadraticCurveTo(-90, -150, -20, -150);
  ctx.lineTo(70, -150);
  ctx.quadraticCurveTo(120, -150, 140, -70);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-85, -76);
  ctx.quadraticCurveTo(-70, -132, -18, -132);
  ctx.lineTo(66, -132);
  ctx.quadraticCurveTo(104, -132, 118, -76);
  ctx.closePath();
  ctx.fillStyle = '#D6ECFF';
  ctx.fill();
  if (driver) {
    ctx.save();
    ctx.clip();
    driver(ctx);
    ctx.restore();
  }
  // body
  fillRR(ctx, -190, -84, 380, 96, 40, color);
  fillRR(ctx, 150, -60, 36, 20, 10, '#FFE38A');
  fillRR(ctx, -186, -60, 24, 20, 10, '#FF7A7A');
  circle(ctx, -110, 14, 40, '#231A3A');
  circle(ctx, 110, 14, 40, '#231A3A');
  circle(ctx, -110, 14, 16, '#9A98B8');
  circle(ctx, 110, 14, 16, '#9A98B8');
  ctx.restore();
}

// Soft floating background shapes so no frame is ever completely static.
export function ambient(ctx, t, palette, seed = 1) {
  for (let i = 0; i < 14; i++) {
    const k = i * 97.3 + seed * 31;
    const x = ((Math.sin(k) * 0.5 + 0.5) * W + Math.sin(t * 0.4 + k) * 30) % W;
    const y = ((Math.cos(k * 1.7) * 0.5 + 0.5) * H + t * (12 + (i % 4) * 6)) % H;
    const c = palette[i % palette.length];
    withAlpha(ctx, 0.16, () => {
      if (i % 3 === 0) circle(ctx, x, y, 10 + (i % 5) * 4, c);
      else if (i % 3 === 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 0.6 + i);
        fillRR(ctx, -12, -12, 24, 24, 6, c);
        ctx.restore();
      } else zelligeStar(ctx, x, y, 14, c, t * 0.3 + i);
    });
  }
}

export function bg(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function blob(ctx, x, y, r, c, a = 0.5) {
  withAlpha(ctx, a, () => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });
}
