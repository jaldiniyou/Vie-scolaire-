// Scene timeline for the TutinGo Reel. All times are in seconds on the master
// voice-over (TIMING.md lists the transcript cue each beat is synced to).
import {
  W, H, BRAND, clamp, lerp, prog, easeOutBack, easeInOutCubic, easeOutCubic, easeOutElastic,
  rr, fillRR, circle, line, withAlpha, pop, rise, text, measure, headline, pill, icons, flag,
  head, person, blinkAt, talkAt, laptop, laptopBack, phone, desk, bookStack, plant, archWindow, zelligeStar,
  speechBubble, car, ambient, bg, blob, SKIN, POSE,
} from './lib.mjs';

// Optional real assets (filled in by render.mjs if files exist in ./assets)
export const ASSETS = { logo: null, screens: {} };

// ---------------------------------------------------------------------------
// Cast
// ---------------------------------------------------------------------------
const YOUSSEF = { skin: SKIN[1], hair: '#24170F', headStyle: 'short', top: BRAND.teal, bottom: '#2E3A6E' };
const SALMA = { skin: SKIN[0], headStyle: 'hijab', scarf: BRAND.accent, top: BRAND.primary, bottom: '#2E2A5C' };
const TUTOR = { skin: SKIN[2], hair: '#1A120D', headStyle: 'bun', top: '#FFFFFF', blazer: BRAND.primaryDark, bottom: '#2E2A5C', glasses: true };
const PRO = { skin: SKIN[1], hair: '#1A120D', headStyle: 'short', top: '#FFFFFF', blazer: '#334155', bottom: '#1E293B', tie: true, beard: true };
const ADULT = { skin: SKIN[3], hair: '#3A2A20', headStyle: 'curly', top: BRAND.yellow, bottom: '#2E2A5C', glasses: false };

// ---------------------------------------------------------------------------
// Brand mark. Placeholder wordmark unless assets/logo.png is supplied.
// ---------------------------------------------------------------------------
export function logo(ctx, x, y, s, t = 0, p = 1) {
  if (ASSETS.logo) {
    // pop in, then wipe the wordmark left → right
    const img = ASSETS.logo;
    const h = 150 * s, w = (img.width / img.height) * h;
    const sp = easeOutBack(clamp(p * 1.4));
    const wp = easeInOutCubic(clamp(p * 1.25));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.6 + 0.4 * sp, 0.6 + 0.4 * sp);
    ctx.globalAlpha *= clamp(p * 3);
    ctx.beginPath();
    ctx.rect(-w / 2 - 20, -h, (w + 40) * wp, h * 2);
    ctx.clip();
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const ip = easeOutBack(clamp(p * 1.6));
  const tp = easeOutCubic(clamp(p * 1.6 - 0.5));
  const wm1 = 'Tutin', wm2 = 'Go';
  const w1 = measure(ctx, wm1, 110, 800), w2 = measure(ctx, wm2, 110, 800);
  const total = 150 + 26 + w1 + w2;
  const ox = -total / 2;
  // icon: rounded bubble with a cap
  ctx.save();
  ctx.translate(ox + 75, 0);
  ctx.scale(ip, ip);
  ctx.rotate((1 - ip) * -0.5);
  fillRR(ctx, -75, -75, 150, 150, 44, BRAND.primary, { blur: 30, y: 14, color: 'rgba(79,70,229,0.35)' });
  ctx.beginPath();
  ctx.moveTo(-40, 60);
  ctx.lineTo(-62, 92);
  ctx.lineTo(-8, 70);
  ctx.closePath();
  ctx.fillStyle = BRAND.primary;
  ctx.fill();
  icons.cap(ctx, 0, -4, 96, BRAND.white);
  circle(ctx, 46, -48, 13, BRAND.yellow);
  ctx.restore();
  // wordmark
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox + 160, -100, total, 200);
  ctx.clip();
  ctx.translate((1 - tp) * -60, 0);
  ctx.globalAlpha *= tp;
  text(ctx, wm1, ox + 176, 6, { size: 110, weight: 800, color: BRAND.ink, align: 'left' });
  text(ctx, wm2, ox + 176 + w1, 6, { size: 110, weight: 800, color: BRAND.primary, align: 'left' });
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Device screens. Schematic UI (shapes and icons only, no invented interface
// text) unless real screenshots are dropped into assets/screens/.
// ---------------------------------------------------------------------------
function drawScreenshot(ctx, img, w, h, scroll = 0) {
  const sw = w, sh = (img.height / img.width) * w;
  ctx.drawImage(img, 0, -Math.min(scroll, Math.max(0, sh - h)), sw, sh);
}

function uiTopBar(ctx, w, s) {
  ctx.fillStyle = BRAND.white;
  ctx.fillRect(0, 0, w, 70 * s);
  if (ASSETS.logo) {
    const lh = 30 * s, lw = (ASSETS.logo.width / ASSETS.logo.height) * lh;
    ctx.drawImage(ASSETS.logo, 22 * s, 20 * s, lw, lh);
  } else {
    fillRR(ctx, 22 * s, 20 * s, 30 * s, 30 * s, 9 * s, BRAND.primary);
    fillRR(ctx, 62 * s, 28 * s, 90 * s, 14 * s, 7 * s, BRAND.ink);
  }
  fillRR(ctx, w - 100 * s, 22 * s, 78 * s, 28 * s, 14 * s, BRAND.primary);
  ctx.fillStyle = '#ECEAF8';
  ctx.fillRect(0, 70 * s, w, 2 * s);
}

export function uiSearch(t, start, key = 'search') {
  return (ctx, w, h) => {
    const img = ASSETS.screens[key];
    if (img) return drawScreenshot(ctx, img, w, h, Math.max(0, t - start) * 40);
    const s = w / 420;
    ctx.fillStyle = BRAND.lavender;
    ctx.fillRect(0, 0, w, h);
    uiTopBar(ctx, w, s);
    // search field with a typing caret
    const sp = prog(t, start + 0.2, 0.5);
    fillRR(ctx, 20 * s, 92 * s, (w - 40 * s), 54 * s, 27 * s, BRAND.white, { blur: 12, y: 4 });
    icons.search(ctx, 50 * s, 119 * s, 26 * s, BRAND.primary);
    const typed = clamp((t - start - 0.4) / 0.9);
    fillRR(ctx, 76 * s, 112 * s, 160 * s * typed, 14 * s, 7 * s, '#BDB8E6');
    if (Math.floor(t * 3) % 2 === 0) fillRR(ctx, 80 * s + 160 * s * typed, 106 * s, 3 * s, 26 * s, 1, BRAND.primary);
    // tutor cards
    for (let i = 0; i < 4; i++) {
      const cp = prog(t, start + 0.9 + i * 0.18, 0.45, easeOutBack);
      if (cp <= 0) continue;
      const cy = 166 * s + i * 104 * s;
      if (cy > h) break;
      ctx.save();
      ctx.translate(0, (1 - cp) * 30 * s);
      ctx.globalAlpha *= clamp(cp);
      fillRR(ctx, 20 * s, cy, w - 40 * s, 92 * s, 18 * s, BRAND.white, { blur: 10, y: 3 });
      circle(ctx, 62 * s, cy + 46 * s, 26 * s, [BRAND.accent, BRAND.teal, BRAND.yellow, BRAND.pink][i]);
      head(ctx, 62 * s, cy + 48 * s, 16 * s, { skin: SKIN[i % 4], style: ['bun', 'short', 'hijab', 'curly'][i], scarf: BRAND.primary, mood: 0.7 });
      fillRR(ctx, 102 * s, cy + 24 * s, 120 * s, 13 * s, 6 * s, BRAND.ink);
      fillRR(ctx, 102 * s, cy + 46 * s, 170 * s, 10 * s, 5 * s, '#D6D3F0');
      for (let k = 0; k < 5; k++) icons.star(ctx, 108 * s + k * 18 * s, cy + 72 * s, 16 * s, BRAND.yellow);
      fillRR(ctx, w - 96 * s, cy + 30 * s, 56 * s, 32 * s, 16 * s, i === 0 ? BRAND.primary : BRAND.lavender);
      ctx.restore();
    }
  };
}

function uiCall(t) {
  // live online lesson: tutor on screen + self view
  return (ctx, w, h) => {
    const img = ASSETS.screens.lesson;
    if (img) return drawScreenshot(ctx, img, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#E9E6FF');
    g.addColorStop(1, '#D7F3EF');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const s = w / 420;
    person(ctx, w * 0.5, h * 1.25, 0.55 * s, { ...TUTOR, mood: 0.8, talk: talkAt(t), blink: blinkAt(t, 2), armL: [1.0 + Math.sin(t * 3) * 0.15, 0.5], armR: POSE.rest });
    fillRR(ctx, w - 120 * s, h - 96 * s, 100 * s, 76 * s, 12 * s, '#2E2A5C');
    head(ctx, w - 70 * s, h - 54 * s, 22 * s, { ...SALMA, style: 'hijab', mood: 0.8, blink: blinkAt(t, 5) });
    circle(ctx, 30 * s, 28 * s, 8 * s, '#FF4D4D');
    fillRR(ctx, 44 * s, 22 * s, 46 * s, 12 * s, 6 * s, 'rgba(30,27,75,0.35)');
  };
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
function floor(ctx, y, c = '#F3E6D6') {
  ctx.fillStyle = c;
  ctx.fillRect(0, y, W, H - y);
}

function chip(ctx, t, start, str, x, y, opts = {}) {
  pop(ctx, t, start, x, y, () => pill(ctx, str, x, y, opts));
}

function iconBadge(ctx, t, start, x, y, r, bgc, iconFn, iconColor = BRAND.white, iconT) {
  pop(ctx, t, start, x, y, () => {
    circle(ctx, x, y + 8, r, 'rgba(30,27,75,0.12)');
    circle(ctx, x, y, r, bgc);
    iconFn(ctx, x, y, r * 1.1, iconColor, iconT);
  });
}

function camera(ctx, t, a, b, fn, zoom = 0.04, cx = W / 2, cy = H * 0.48) {
  const p = clamp((t - a) / (b - a));
  const z = 1 + zoom * easeInOutCubic(p);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
  fn();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// SCENE 1 — The problem (0.0 – 6.2)
// 0.0 "Bghiti tt3allem" · 0.92 l'anglais · 1.6 l'français · 2.42 l'espagnol · 2.94 l'allemand
// 3.62 "Walakin ma 3endekch l-weqt" · 5.2 "z-z7am kay3ayyik"
// ---------------------------------------------------------------------------
function scene1(ctx, t) {
  const toTraffic = prog(t, 3.45, 0.6, easeInOutCubic);
  bg(ctx, lerp(0, 1, toTraffic) > 0.5 ? '#FFE9D6' : BRAND.cream, '#FFF3E6');
  blob(ctx, 200, 500, 420, BRAND.yellow, 0.35);
  blob(ctx, 900, 1300, 460, BRAND.pink, 0.2);
  ambient(ctx, t, [BRAND.primary, BRAND.accent, BRAND.teal], 1);

  // Part A: languages
  withAlpha(ctx, 1 - toTraffic, () => {
    ctx.save();
    ctx.translate(-toTraffic * 300, 0);
    headline(ctx, t, 0.05, 'بغيتي *تتعلّم*', 360, { size: 96 });
    headline(ctx, t, 0.25, 'شي لغة جديدة؟', 480, { size: 96 });
    // room
    archWindow(ctx, 790, 640, 260, 360);
    floor(ctx, 1480);
    plant(ctx, 150, 1480, 1.3);
    person(ctx, 520, 1490, 1.25, {
      ...YOUSSEF, mood: 0.6, blink: blinkAt(t), look: 0.3, lookY: 1, tilt: 0.04,
      armL: POSE.chest, armR: POSE.restOut,
      hold: (c, hx, hy) => phone(c, hx + 18, hy - 30, 66, uiSearch(t, 0.4), { rot: -0.12 }),
    });
    // language chips around the head, on each spoken word
    chip(ctx, t, 0.92, 'الإنجليزية', 250, 700, { size: 44, flagCode: 'gb' });
    chip(ctx, t, 1.6, 'الفرنسية', 820, 1080, { size: 44, flagCode: 'fr' });
    chip(ctx, t, 2.42, 'الإسبانية', 240, 1180, { size: 44, flagCode: 'es' });
    chip(ctx, t, 2.94, 'الألمانية', 820, 1290, { size: 44, flagCode: 'de' });
    ctx.restore();
  });

  // Part B: traffic + clock + calendar
  if (toTraffic > 0) {
    ctx.save();
    ctx.translate((1 - toTraffic) * 600, 0);
    ctx.globalAlpha *= toTraffic;
    // city skyline
    for (let i = 0; i < 9; i++) {
      const bw = 110 + (i % 3) * 30, bh = 260 + ((i * 73) % 5) * 70;
      fillRR(ctx, i * 125 - 20, 1180 - bh, bw, bh + 40, 14, ['#E6D2C0', '#D9C2AE', '#EBDCCD'][i % 3]);
      for (let k = 0; k < 4; k++) fillRR(ctx, i * 125 + 10, 1180 - bh + 30 + k * 60, 26, 30, 6, 'rgba(255,255,255,0.7)');
    }
    // road
    ctx.fillStyle = '#4B4A63';
    ctx.fillRect(0, 1180, W, 360);
    for (let i = 0; i < 8; i++) fillRR(ctx, ((i * 180 - t * 40) % (W + 200)) - 100, 1355, 100, 14, 7, '#F5F3FF');
    // cars barely moving (traffic jam)
    const crawl = Math.sin(t * 2) * 6;
    car(ctx, 80 + crawl, 1300, 0.85, BRAND.pink);
    car(ctx, 990 - crawl, 1300, 0.85, BRAND.yellow);
    car(ctx, 520 + crawl * 0.5, 1490, 1.25, BRAND.teal, (c) => {
      head(c, 20, -78, 52, { ...YOUSSEF, style: 'short', mood: -0.8, blink: blinkAt(t, 1), look: t > 5 ? 0.8 : -0.6, tilt: Math.sin(t * 3) * 0.05 });
    });
    car(ctx, 90 - crawl, 1500, 1.0, BRAND.primary);
    // honk lines
    const honk = (t * 3) % 1;
    withAlpha(ctx, 1 - honk, () => {
      for (let k = -1; k <= 1; k++) line(ctx, 250 + honk * 30, 1440 + k * 30, 290 + honk * 40, 1440 + k * 40, 8, BRAND.accent);
    });
    headline(ctx, t, 3.7, 'ما عندكش *الوقت؟*', 380, { size: 88 });
    // ticking clock (fast) and a calendar filling up
    iconBadge(ctx, t, 4.0, 260, 700, 120, BRAND.white, (c, x, y, s) => icons.clock(c, x, y, s, BRAND.primary, t * 6), BRAND.primary);
    pop(ctx, t, 4.4, 760, 720, () => {
      fillRR(ctx, 600, 590, 320, 280, 32, BRAND.white, { blur: 30, y: 12 });
      fillRR(ctx, 600, 590, 320, 70, 32, BRAND.accent);
      ctx.fillStyle = BRAND.accent;
      ctx.fillRect(600, 630, 320, 30);
      for (let i = 0; i < 12; i++) {
        const cx = 630 + (i % 4) * 70, cy = 680 + Math.floor(i / 4) * 60;
        const filled = t > 4.6 + i * 0.07;
        fillRR(ctx, cx, cy, 52, 44, 10, filled ? [BRAND.pink, BRAND.primary, BRAND.teal][i % 3] : '#EEEAF9');
      }
    });
    rise(ctx, t, 5.2, () => pill(ctx, 'الزحام كيعيّيك…', W / 2, 1000, { size: 46, bg: BRAND.ink, fg: BRAND.white }));
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// SCENE 2 — Introducing TutinGo (6.2 – 12.15)
// 7.18 "TutinGo" · 8.0 "khtar" · 8.9 "cours online" · 9.7 "wla présentiel" · 10.5 "w l-prof yji 7tal darek"
// ---------------------------------------------------------------------------
function scene2(ctx, t) {
  bg(ctx, BRAND.lavender, '#FFFFFF');
  blob(ctx, 540, 700, 600, '#C7C2FF', 0.5);
  ambient(ctx, t, [BRAND.primary, BRAND.yellow, BRAND.teal], 2);
  // logo reveal, then shrink to the top
  const lp = clamp((t - 6.35) / 0.9);
  const up = prog(t, 7.9, 0.6, easeInOutCubic);
  const bounce = t > 7.18 && t < 7.6 ? Math.sin((t - 7.18) / 0.42 * Math.PI) * 0.06 : 0;
  // radiating rings behind the logo
  for (let k = 0; k < 3; k++) {
    const rp = clamp((t - 6.4 - k * 0.15) / 1.1);
    if (rp > 0 && rp < 1) withAlpha(ctx, (1 - rp) * (1 - up), () => {
      ctx.beginPath();
      ctx.arc(W / 2, 900, 120 + rp * 520, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = BRAND.primary;
      ctx.stroke();
    });
  }
  logo(ctx, W / 2, lerp(900, 330, up), lerp(1.15, 0.72, up) + bounce, t, lp);

  const out = prog(t, 10.25, 0.5, easeInOutCubic);
  if (t > 7.9) {
    // devices showing the platform (they make room for the house at 10.3)
    const dp = prog(t, 8.0, 0.6, easeOutBack);
    ctx.save();
    ctx.translate(0, (1 - dp) * 500 - out * 300);
    ctx.globalAlpha *= clamp(dp * 1.5) * (1 - out);
    laptop(ctx, 470, 1060, 680, uiSearch(t, 8.1, 'search'));
    phone(ctx, 850, 1000, 210, uiSearch(t, 8.4, 'mobile'), { rot: 0.06 });
    ctx.restore();
    // cursor travelling to the first card
    const cp = prog(t, 9.0, 0.7, easeInOutCubic);
    if (t > 8.6 && t < 10.4) {
      const cx = lerp(330, 560, cp), cy = lerp(760, 830, cp);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 34, cy + 40);
      ctx.lineTo(cx + 14, cy + 40);
      ctx.lineTo(cx + 4, cy + 58);
      ctx.closePath();
      ctx.fillStyle = BRAND.ink;
      ctx.fill();
    }
    ctx.save();
    ctx.translate(0, -out * 640);
    chip(ctx, t, 8.9, 'أونلاين', 300, 1240, { size: 46, bg: BRAND.primary, fg: BRAND.white, icon: icons.laptop, iconBg: 'rgba(255,255,255,0.22)' });
    chip(ctx, t, 9.7, 'حضوري', 760, 1240, { size: 46, bg: BRAND.accent, fg: BRAND.white, icon: icons.home, iconBg: 'rgba(255,255,255,0.25)' });
    ctx.restore();
  }
  // the tutor walks to the learner's door
  if (t > 10.3) {
    const hp = prog(t, 10.3, 0.5);
    ctx.save();
    ctx.globalAlpha *= hp;
    ctx.translate(0, (1 - hp) * 80);
    floor(ctx, 1410, '#E8E4FF');
    ctx.translate(-120, -150);
    ctx.translate(540, 1560);
    ctx.scale(1.35, 1.35);
    ctx.translate(-540, -1560);
    // house
    const hx = 760;
    fillRR(ctx, hx - 150, 1330, 300, 230, 18, '#FFE3C7');
    ctx.beginPath();
    ctx.moveTo(hx - 180, 1340);
    ctx.lineTo(hx, 1210);
    ctx.lineTo(hx + 180, 1340);
    ctx.closePath();
    ctx.fillStyle = BRAND.accent;
    ctx.fill();
    const doorOpen = prog(t, 11.3, 0.4);
    fillRR(ctx, hx - 48, 1420, 96, 140, 12, '#5B3A29');
    fillRR(ctx, hx - 48, 1420, 96 * (1 - doorOpen * 0.75), 140, 12, '#8A5A3C');
    archWindow(ctx, hx + 95, 1380, 50, 70);
    archWindow(ctx, hx - 95, 1380, 50, 70);
    const wx = lerp(300, 640, prog(t, 10.4, 0.9, (p) => p));
    person(ctx, wx, 1580, 0.62, { ...TUTOR, walk: t * 9, mood: 0.8, blink: blinkAt(t, 3), armL: [0.1 + Math.max(0, Math.sin(t * 9)) * 0.3, -0.15], armR: [0.1 + Math.max(0, -Math.sin(t * 9)) * 0.3, -0.15], hold: (c, x, y) => icons.book(c, x, y + 20, 60, BRAND.primary) });
    ctx.restore();
    rise(ctx, t, 10.6, () => pill(ctx, 'الأستاذ يجي حتى لدارك', W / 2, 1490, { size: 46, bg: BRAND.white, icon: icons.home }));
  }
}

// ---------------------------------------------------------------------------
// SCENE 3 — Qualified teachers (12.15 – 16.95)
// 12.14 "T3allem m3a" · 13.14 "assatida mou2ahhalin" · 14.46 "b programme mlaa2em" · 15.44 "l-niveau" · 15.86 "w l-objectifs dyalek"
// ---------------------------------------------------------------------------
function scene3(ctx, t) {
  bg(ctx, '#E6FBF7', '#FFFFFF');
  blob(ctx, 300, 900, 520, '#9FEADB', 0.45);
  ambient(ctx, t, [BRAND.teal, BRAND.primary, BRAND.yellow], 3);
  camera(ctx, t, 12.15, 16.95, () => {
    headline(ctx, t, 12.3, 'أساتذة *مؤهّلين*', 360, { size: 90, mark: '#9FEADB' });
    // whiteboard
    fillRR(ctx, 120, 560, 520, 340, 26, BRAND.white, { blur: 30, y: 12 });
    fillRR(ctx, 120, 560, 520, 340, 26, 'rgba(79,70,229,0.04)');
    const wb = prog(t, 12.6, 1.2, (p) => p);
    ctx.save();
    ctx.beginPath();
    ctx.rect(120, 560, 520 * wb + 1, 340);
    ctx.clip();
    text(ctx, 'Hello · Bonjour · Hola', 380, 640, { size: 40, weight: 700, color: BRAND.primary });
    text(ctx, 'a² + b² = c²', 380, 730, { size: 52, weight: 800, color: BRAND.ink });
    line(ctx, 190, 800, 570, 800, 8, BRAND.accent);
    ctx.restore();
    floor(ctx, 1500, '#E9F6F2');
    // tutor explaining at the board
    person(ctx, 330, 1500, 1.05, {
      ...TUTOR, mood: 0.8, talk: talkAt(t, t < 16.9), blink: blinkAt(t, 2),
      armL: [POSE.point[0] + Math.sin(t * 2.5) * 0.12, POSE.point[1]], armR: POSE.rest,
    });
    // student at a desk
    // student behind her desk, looking over the laptop at the tutor
    person(ctx, 800, 1225, 0.82, { ...SALMA, sitting: true, mood: 0.75, blink: blinkAt(t, 4), look: -0.9, armL: POSE.type, armR: POSE.type });
    desk(ctx, 800, 1240, 380);
    laptopBack(ctx, 820, 1240, 170);
    bookStack(ctx, 690, 1240, 0.5);
    // floating education elements
    const fl = (k) => Math.sin(t * 2 + k) * 12;
    pop(ctx, t, 12.9, 850, 610 + fl(1), () => {
      speechBubble(ctx, 850, 610 + fl(1), 220, 90);
      text(ctx, 'ABC', 850, 613 + fl(1), { size: 48, weight: 800, color: BRAND.primary });
    });
    // qualified badge on the spoken word
    chip(ctx, t, 13.14, 'عندهم الديبلومات والخبرة', W / 2, 475, { size: 38, icon: icons.check, iconBg: BRAND.teal });
    // adapted programme: level bars + target
    pop(ctx, t, 14.46, 850, 850, () => {
      fillRR(ctx, 690, 730, 320, 230, 26, BRAND.white, { blur: 26, y: 10 });
      icons.chartUp(ctx, 970, 770, 36, BRAND.primary);
      text(ctx, 'المستوى', 940, 772, { size: 30, weight: 800, align: 'right' });
      [0.45, 0.7, 0.95].forEach((v, i) => {
        const bp = prog(t, 14.7 + i * 0.15, 0.5);
        fillRR(ctx, 720, 820 + i * 44, 260, 24, 12, '#EAE8F8');
        fillRR(ctx, 720, 820 + i * 44, 260 * v * bp, 24, 12, [BRAND.teal, BRAND.primary, BRAND.accent][i]);
      });
    });
    iconBadge(ctx, t, 15.86, 690, 730, 46, BRAND.accent, icons.target, BRAND.white);
  }, 0.05);
}

// ---------------------------------------------------------------------------
// SCENE 4 — Learner profiles (16.95 – 22.8)
// 16.94 "Bghiti t7assen l-anglais dyalek" · 18.96 "tewjed l-examen international" · 20.58 "wla t7assen l-parcours professionnel dyalek"
// ---------------------------------------------------------------------------
function profileCard(ctx, t, start, y, color, who, title, sub, iconFn, flagCode) {
  const p = prog(t, start, 0.55, easeOutBack);
  if (p <= 0) return;
  ctx.save();
  ctx.translate((1 - p) * (y % 2 ? -700 : 700), 0);
  ctx.globalAlpha *= clamp(p * 1.4);
  fillRR(ctx, 90, y, 900, 270, 44, BRAND.white, { blur: 36, y: 14 });
  ctx.save();
  rr(ctx, 90, y, 300, 270, 44);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(90, y, 300, 270);
  person(ctx, 240, y + 520, 0.95, { ...who, mood: 0.75, blink: blinkAt(t, y), talk: 0 });
  ctx.restore();
  text(ctx, title, 945, y + 95, { size: 48, weight: 800, align: 'right' });
  text(ctx, sub, 945, y + 165, { size: 36, weight: 600, color: BRAND.muted, align: 'right' });
  if (flagCode) pop(ctx, t, start + 0.3, 950 - measure(ctx, title, 48, 800) - 50, y + 95, () => flag(ctx, flagCode, 950 - measure(ctx, title, 48, 800) - 50, y + 95, 28));
  iconBadge(ctx, t, start + 0.35, 450, y + 210, 36, color, iconFn);
  ctx.restore();
}

function scene4(ctx, t) {
  bg(ctx, '#FFF4E8', '#FFFFFF');
  blob(ctx, 800, 600, 500, '#FFD3B0', 0.5);
  ambient(ctx, t, [BRAND.accent, BRAND.primary, BRAND.pink], 4);
  headline(ctx, t, 17.0, 'شنو *بغيتي* تقرا؟', 330, { size: 90, mark: '#FFD3B0' });
  profileCard(ctx, t, 17.1, 470, BRAND.teal, YOUSSEF, 'الإنجليزية', 'حسّن الإنجليزية ديالك', icons.chartUp, 'gb');
  profileCard(ctx, t, 18.95, 790, BRAND.primary, SALMA, 'امتحان دولي', 'التحضير، بحال TOEFL', icons.cap);
  profileCard(ctx, t, 20.55, 1110, BRAND.accent, PRO, 'المسار المهني', 'مقابلة العمل والتواصل', icons.briefcase);
  // floating English vocabulary
  const words = ['Vocabulary', 'Speaking', 'Interview'];
  words.forEach((wd, i) => {
    const st = [17.6, 19.4, 21.1][i];
    withAlpha(ctx, window_(t, st, 22.9, 0.3), () => {
      const yy = 1470 + Math.sin(t * 2 + i) * 10;
      pill(ctx, wd, 230 + i * 310, yy, { size: 32, bg: [BRAND.teal, BRAND.primary, BRAND.accent][i], fg: BRAND.white, shadow: false });
    });
  });
}
const window_ = (t, a, b, f) => clamp(Math.min((t - a) / f, (b - t) / f));

// ---------------------------------------------------------------------------
// SCENE 5 — Training that fits you (22.8 – 31.3)
// 22.78 "TutinGo katwjjed lik l-formation li katnasbek" · 26.5 "préparation l-examen" · ~28.5 "TESOL w CELTA" · 29.8 "selon les programmes disponibles"
// ---------------------------------------------------------------------------
function scene5(ctx, t) {
  bg(ctx, BRAND.lavender, '#FFFFFF');
  blob(ctx, 540, 1000, 640, '#D5D1FF', 0.5);
  ambient(ctx, t, [BRAND.primary, BRAND.teal, BRAND.yellow], 5);
  pop(ctx, t, 22.8, W / 2, 300, () => logo(ctx, W / 2, 300, 0.6, t, 1));
  headline(ctx, t, 23.4, 'التكوين لي *كيناسبك*', 470, { size: 84 });
  // levels staircase
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  levels.forEach((lv, i) => {
    const p = prog(t, 24.2 + i * 0.12, 0.45, easeOutBack);
    if (p <= 0) return;
    const bx = 150 + i * 135, bh = 70 + i * 40, base = 880;
    ctx.save();
    ctx.translate(0, (1 - p) * 80);
    ctx.globalAlpha *= clamp(p * 1.5);
    fillRR(ctx, bx, base - bh, 112, bh, 18, [BRAND.teal, BRAND.teal, BRAND.primary, BRAND.primary, BRAND.accent, BRAND.accent][i]);
    text(ctx, lv, bx + 56, base - bh + 36, { size: 34, weight: 800, color: BRAND.white });
    ctx.restore();
  });
  // student climbing
  // hops from step to step
  const hop = clamp((t - 24.9) / 0.32, 0, 5);
  const k = Math.floor(hop), f = hop - k;
  const stepTop = (i) => 880 - (70 + Math.min(5, i) * 40) - 48;
  const hx = lerp(206 + k * 135, 206 + Math.min(5, k + 1) * 135, k < 5 ? easeInOutCubic(f) : 0);
  const hy = k < 5 ? lerp(stepTop(k), stepTop(k + 1), f) - Math.sin(f * Math.PI) * 50 : stepTop(5);
  if (t > 24.5) withAlpha(ctx, prog(t, 24.5, 0.3), () => head(ctx, hx, hy, 40, { ...YOUSSEF, style: 'short', mood: 0.9, blink: blinkAt(t) }));

  // Exam preparation (TOEFL) vs teacher training (TESOL / CELTA) — kept distinct
  const card = (x, y, start, color, title, sub, tags, iconFn) => {
    const p = prog(t, start, 0.55, easeOutBack);
    if (p <= 0) return;
    ctx.save();
    ctx.translate(x + 220, y + 200);
    ctx.scale(p, p);
    ctx.translate(-x - 220, -y - 200);
    ctx.globalAlpha *= clamp(p * 1.5);
    fillRR(ctx, x, y, 440, 400, 40, BRAND.white, { blur: 34, y: 14 });
    fillRR(ctx, x, y, 440, 16, 8, color);
    iconBadge(ctx, t, start + 0.15, x + 360, y + 90, 46, color, iconFn);
    text(ctx, title, x + 400, y + 178, { size: 42, weight: 800, align: 'right' });
    text(ctx, sub, x + 400, y + 232, { size: 32, weight: 600, color: BRAND.muted, align: 'right' });
    tags.forEach(([tag, ts], i) => pop(ctx, t, ts, x + 110 + i * 200, y + 320, () => pill(ctx, tag, x + 110 + i * 200, y + 320, { size: 40, bg: color, fg: BRAND.white, weight: 800, shadow: false })));
    ctx.restore();
  };
  card(560, 960, 26.2, BRAND.teal, 'التحضير', 'للامتحانات', [['TOEFL', 26.9]], icons.cap);
  card(80, 960, 27.9, BRAND.accent, 'تكوين', 'الأساتذة', [['TESOL', 28.4], ['CELTA', 28.9]], icons.book);
  rise(ctx, t, 29.8, () => pill(ctx, 'حسب البرامج المتوفّرة', W / 2, 1450, { size: 36, bg: BRAND.ink, fg: BRAND.white }));
}

// ---------------------------------------------------------------------------
// SCENE 6 — Learn where and when it suits you (31.3 – 41.35)
// 31.3 "Qra f l-mkan w f l-weqt li kaynasbek" · 34.0 "online" · 35.2 "wla présentiel"
// 36.0 "w m3a ba3d l-formations" · 38.3 "certificat" · 39.5 "délivré mn l-organisme"
// ---------------------------------------------------------------------------
function scene6(ctx, t) {
  bg(ctx, '#FFF8F0', '#FFFFFF');
  ambient(ctx, t, [BRAND.primary, BRAND.accent, BRAND.teal], 6);
  const toCert = prog(t, 35.85, 0.6, easeInOutCubic);
  // city → calm room (opening transition)
  const calm = prog(t, 31.3, 0.9, easeInOutCubic);
  withAlpha(ctx, 1 - calm, () => {
    ctx.fillStyle = '#4B4A63';
    ctx.fillRect(0, 1180, W, 400);
    car(ctx, 300 - t * 80 + 2600, 1400, 1, BRAND.pink);
  });
  withAlpha(ctx, 1 - toCert, () => {
    headline(ctx, t, 31.4, 'فالبلاصة والوقت', 330, { size: 86 });
    headline(ctx, t, 31.6, 'لي *كيناسبوك*', 435, { size: 86 });
    // split screen panels
    const sp = prog(t, 31.5, 0.7, easeOutCubic);
    const panel = (x, color, fn, labelStart, label, labelColor, iconFn) => {
      ctx.save();
      ctx.translate(0, (1 - sp) * 200);
      ctx.globalAlpha *= sp;
      ctx.save();
      rr(ctx, x, 520, 470, 820, 44);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.clip();
      fn(x);
      ctx.restore();
      ctx.restore();
      chip(ctx, t, labelStart, label, x + 235, 1290, { size: 40, bg: labelColor, fg: BRAND.white, icon: iconFn, iconBg: 'rgba(255,255,255,0.25)' });
    };
    panel(50, '#E7E5FF', (x) => {
      fillRR(ctx, x, 1130, 470, 300, 0, '#D6D2FA');
      // live lesson window (what she sees on her screen)
      fillRR(ctx, x + 85, 560, 300, 196, 22, '#2E2A5C', { blur: 26, y: 10 });
      ctx.save();
      rr(ctx, x + 94, 569, 282, 178, 16);
      ctx.clip();
      ctx.translate(x + 94, 569);
      uiCall(t)(ctx, 282, 178);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(x + 220, 755);
      ctx.lineTo(x + 235, 782);
      ctx.lineTo(x + 250, 755);
      ctx.fillStyle = '#2E2A5C';
      ctx.fill();
      person(ctx, x + 235, 1045, 0.66, { ...SALMA, sitting: true, mood: 0.85, blink: blinkAt(t, 1), lookY: 0.4, armL: POSE.type, armR: POSE.type });
      desk(ctx, x + 235, 1060, 400);
      laptopBack(ctx, x + 235, 1060, 170);
      plant(ctx, x + 400, 1060, 0.6);
    }, 34.0, 'أونلاين', BRAND.primary, icons.laptop);
    panel(560, '#FFE9D6', (x) => {
      archWindow(ctx, x + 120, 600, 140, 200);
      for (let i = 0; i < 6; i++) zelligeStar(ctx, x + 40 + i * 80, 1140, 22, i % 2 ? BRAND.teal : BRAND.primary, 0);
      fillRR(ctx, x, 1170, 470, 300, 0, '#F3D9C0');
      // sofa
      fillRR(ctx, x + 40, 960, 390, 120, 40, BRAND.teal);
      person(ctx, x + 330, 1060, 0.7, { ...TUTOR, sitting: true, mood: 0.85, talk: talkAt(t, t < 35.8), blink: blinkAt(t, 3), look: -0.8, armL: [1.05 + Math.sin(t * 3) * 0.15, 0.45], armR: POSE.rest });
      person(ctx, x + 140, 1060, 0.62, { ...YOUSSEF, sitting: true, mood: 0.8, blink: blinkAt(t, 6), look: 0.8, armL: POSE.chest, armR: POSE.chest, hold: (c, hx, hy) => icons.book(c, hx + 22, hy - 4, 84, BRAND.accent) });
    }, 35.2, 'حضوري', BRAND.accent, icons.home);
    // flexibility icons on the spoken phrase
    iconBadge(ctx, t, 31.9, 540, 640, 50, BRAND.white, icons.calendar, BRAND.primary);
    iconBadge(ctx, t, 32.6, 860, 610, 56, BRAND.white, (c, x, y, s, col) => icons.clock(c, x, y, s, col, t * 2), BRAND.primary);
    iconBadge(ctx, t, 33.3, 540, 780, 50, BRAND.accent, icons.pin);
    iconBadge(ctx, t, 33.8, 540, 920, 50, BRAND.teal, icons.check);
  });
  // certificate (depends on the programme and the issuing organisation)
  if (toCert > 0) {
    ctx.save();
    ctx.globalAlpha *= toCert;
    ctx.translate(0, (1 - toCert) * 200);
    headline(ctx, t, 36.0, 'مع بعض التكوينات', 360, { size: 84 });
    const cp = prog(t, 37.9, 0.6, easeOutBack);
    if (cp > 0) {
      ctx.save();
      ctx.translate(W / 2, 900);
      ctx.scale(cp, cp);
      ctx.rotate((1 - cp) * 0.2 - 0.03);
      fillRR(ctx, -380, -270, 760, 540, 30, BRAND.white, { blur: 40, y: 18 });
      ctx.lineWidth = 10;
      ctx.strokeStyle = BRAND.yellow;
      rr(ctx, -350, -240, 700, 480, 20);
      ctx.stroke();
      icons.certificate(ctx, 0, -140, 110, BRAND.primary);
      fillRR(ctx, -230, -40, 460, 22, 11, BRAND.ink);
      fillRR(ctx, -180, 10, 360, 16, 8, '#D6D3F0');
      fillRR(ctx, -200, 50, 400, 16, 8, '#D6D3F0');
      fillRR(ctx, -260, 150, 180, 8, 4, '#B8B4DC');
      // ribbon seal
      circle(ctx, 230, 150, 64, BRAND.accent);
      icons.star(ctx, 230, 150, 70, BRAND.yellow);
      ctx.restore();
    }
    // accurate label — no promise that TutinGo itself awards it
    rise(ctx, t, 38.3, () => pill(ctx, 'شهادة', W / 2, 1250, { size: 46, bg: BRAND.primary, fg: BRAND.white, icon: icons.check, iconBg: 'rgba(255,255,255,0.25)' }));
    rise(ctx, t, 39.5, () => pill(ctx, 'كتسلّمها الجهة المعنية', W / 2, 1370, { size: 36, bg: BRAND.white }));
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// SCENE 7a — How it works (41.35 – 47.2)
// 41.4 "Dkhol l tutingo.com" · 43.6 "khtar l-formation dyalek" · 44.9 "w bda" · 45.6 "t7aqqaq l-ahdaf dyalek"
// ---------------------------------------------------------------------------
function scene7a(ctx, t) {
  bg(ctx, '#EEF0FF', '#FFFFFF');
  blob(ctx, 540, 500, 560, '#D5D1FF', 0.5);
  ambient(ctx, t, [BRAND.primary, BRAND.teal, BRAND.accent], 7);
  // browser bar with the address
  pop(ctx, t, 41.45, W / 2, 330, () => {
    fillRR(ctx, 110, 270, 860, 120, 60, BRAND.white, { blur: 30, y: 12 });
    icons.search(ctx, 180, 330, 46, BRAND.primary);
    const url = 'www.tutingo.com';
    const n = Math.round(clamp((t - 41.6) / 0.8) * url.length);
    text(ctx, url.slice(0, n), 230, 334, { size: 52, weight: 800, color: BRAND.ink, align: 'left' });
    if (n < url.length || Math.floor(t * 3) % 2) fillRR(ctx, 236 + measure(ctx, url.slice(0, n), 52, 800), 300, 5, 64, 2, BRAND.primary);
  });
  const steps = [
    [41.9, 'دير حساب', icons.user, BRAND.primary],
    [43.6, 'ختار المادة والأستاذ', icons.search, BRAND.teal],
    [44.6, 'حجز الموعد ديالك', icons.calendar, BRAND.accent],
    [45.5, 'أونلاين ولا فالدار', icons.play, BRAND.pink],
  ];
  // phone with the platform on the right
  const pp = prog(t, 41.8, 0.6, easeOutBack);
  ctx.save();
  ctx.translate((1 - pp) * 500, 0);
  phone(ctx, 845, 930, 270, uiSearch(t, 43.6, 'mobile'), { rot: 0.04 });
  ctx.restore();
  steps.forEach(([st, label, ic, col], i) => {
    const y = 560 + i * 200;
    const active = t >= st && (i === steps.length - 1 || t < steps[i + 1][0]);
    rise(ctx, t, st, () => {
      fillRR(ctx, 60, y, 600, 160, 40, active ? BRAND.white : 'rgba(255,255,255,0.75)', active ? { blur: 34, y: 14 } : null);
      circle(ctx, 570, y + 80, 52, col);
      text(ctx, String(i + 1), 570, y + 84, { size: 52, weight: 800, color: BRAND.white });
      text(ctx, label, 495, y + 62, { size: 38, weight: 800, align: 'right' });
      ic(ctx, 470, y + 115, 40, col);
      if (t > st + 0.6) icons.check(ctx, 110, y + 80, 34, BRAND.teal);
    }, 40);
  });
  // connector line
  const lp = clamp((t - 42.0) / 4.0);
  line(ctx, 570, 640, 570, 640 + 600 * lp, 6, 'rgba(79,70,229,0.18)');
  // goal achieved
  iconBadge(ctx, t, 45.9, 880, 1340, 60, BRAND.accent, icons.target);
  rise(ctx, t, 45.9, () => pill(ctx, 'حقّق الأهداف ديالك', 540, 1420, { size: 40, bg: BRAND.ink, fg: BRAND.white }));
}

// ---------------------------------------------------------------------------
// SCENE 7b — Call to action (47.2 – end)
// 47.1 "TutinGo" · 47.9 "t3allem fin ma bghiti" · 49.4 "w 7tta l-prof yji 3endek l-dar"
// ---------------------------------------------------------------------------
function scene7b(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, BRAND.primary);
  g.addColorStop(1, BRAND.primaryDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  blob(ctx, 200, 400, 500, '#9B6BFF', 0.45);
  blob(ctx, 900, 1500, 600, BRAND.pink, 0.25);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + t * 0.1;
    withAlpha(ctx, 0.12, () => zelligeStar(ctx, W / 2 + Math.cos(a) * 520, 860 + Math.sin(a) * 520, 18, BRAND.white, t * 0.4 + i));
  }
  // logo on a white card
  pop(ctx, t, 47.15, W / 2, 380, () => {
    fillRR(ctx, 130, 270, 820, 220, 60, BRAND.white, { blur: 50, y: 20, color: 'rgba(0,0,0,0.25)' });
    logo(ctx, W / 2, 380, 0.92, t, clamp((t - 47.15) / 0.9));
  }, 0.6);
  // characters together
  const cp = prog(t, 47.5, 0.7, easeOutBack);
  ctx.save();
  ctx.translate(0, (1 - cp) * 400);
  ctx.globalAlpha *= clamp(cp * 1.5);
  fillRR(ctx, 60, 1385, 960, 36, 18, 'rgba(0,0,0,0.12)');
  person(ctx, 240, 1400, 0.85, { ...TUTOR, mood: 0.9, blink: blinkAt(t, 2), armL: POSE.wave(t), armR: POSE.rest });
  person(ctx, 840, 1400, 0.85, { ...SALMA, mood: 0.95, blink: blinkAt(t, 5), armL: POSE.rest, armR: POSE.wave(t + 1) });
  laptop(ctx, 540, 1388, 300, uiCall(t));
  bookStack(ctx, 405, 1392, 0.65);
  phone(ctx, 690, 1300, 86, uiSearch(t, 47.5), { rot: 0.15 });
  ctx.restore();
  // slogan from the voice-over
  rise(ctx, t, 47.9, () => text(ctx, 'تعلّم فين ما بغيتي', W / 2, 600, { size: 88, weight: 800, color: BRAND.white }));
  rise(ctx, t, 49.4, () => {
    fillRR(ctx, 120, 665, 840, 100, 50, BRAND.yellow);
    text(ctx, 'والأستاذ يجي حتى لدارك!', W / 2, 717, { size: 60, weight: 800, color: BRAND.ink });
  });
  // URL — readable, held to the very end
  pop(ctx, t, 50.4, W / 2, 1515, () => {
    fillRR(ctx, 170, 1455, 740, 120, 60, BRAND.white, { blur: 40, y: 16, color: 'rgba(0,0,0,0.25)' });
    icons.pin(ctx, 250, 1515, 56, BRAND.primary);
    text(ctx, 'www.tutingo.com', 570, 1518, { size: 58, weight: 800, color: BRAND.primary });
  });
  // sparkle burst when the URL lands
  for (let i = 0; i < 12; i++) {
    const p = clamp((t - 50.4) / 0.9);
    if (p <= 0 || p >= 1) continue;
    const a = (i / 12) * Math.PI * 2;
    withAlpha(ctx, 1 - p, () => icons.star(ctx, W / 2 + Math.cos(a) * (200 + p * 260), 1515 + Math.sin(a) * (60 + p * 140), 34, [BRAND.yellow, BRAND.white, BRAND.pink][i % 3]));
  }
}

// ---------------------------------------------------------------------------
// Timeline + transitions
// ---------------------------------------------------------------------------
export const SCENES = [
  { start: 0.0, draw: scene1 },
  { start: 6.2, draw: scene2, from: [W / 2, 900], color: BRAND.primary },
  { start: 12.15, draw: scene3, from: [200, 1600], color: BRAND.teal },
  { start: 16.95, draw: scene4, from: [W, 300], color: BRAND.accent },
  { start: 22.8, draw: scene5, from: [0, 300], color: BRAND.primary },
  { start: 31.3, draw: scene6, from: [W / 2, 1900], color: BRAND.yellow },
  { start: 41.35, draw: scene7a, from: [W, 1000], color: BRAND.teal },
  { start: 47.15, draw: scene7b, from: [W / 2, 400], color: BRAND.primary },
];
export const DURATION = 54.0; // voice-over is 51.48 s; final frame held ~2.5 s for the URL

const TR = 0.55; // transition length (s), centred on the scene start

export function drawFrame(ctx, t) {
  let i = SCENES.findIndex((s, k) => t >= s.start && (k === SCENES.length - 1 || t < SCENES[k + 1].start));
  if (i < 0) i = 0;
  const cur = SCENES[i], next = SCENES[i + 1];
  // transition into the next scene starts TR/2 before its start time
  if (next && t > next.start - TR / 2) {
    cur.draw(ctx, t);
    circleWipe(ctx, t, next, (t - (next.start - TR / 2)) / TR);
    return;
  }
  if (i > 0 && t < cur.start + TR / 2) {
    SCENES[i - 1].draw(ctx, t);
    circleWipe(ctx, t, cur, (t - (cur.start - TR / 2)) / TR);
    return;
  }
  cur.draw(ctx, t);
}

function circleWipe(ctx, t, scene, p) {
  p = easeInOutCubic(clamp(p));
  const [fx, fy] = scene.from;
  const R = Math.hypot(Math.max(fx, W - fx), Math.max(fy, H - fy)) * 1.05;
  // coloured leading ring, then the new scene inside
  ctx.save();
  ctx.beginPath();
  ctx.arc(fx, fy, R * clamp(p * 1.15), 0, Math.PI * 2);
  ctx.fillStyle = scene.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(fx, fy, R * clamp(p * 1.15 - 0.15) , 0, Math.PI * 2);
  ctx.clip();
  scene.draw(ctx, t);
  ctx.restore();
}
