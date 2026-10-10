"""Cut-out collage toolkit: paper textures, torn cards, stickers, figures, icons.

Everything is drawn procedurally (no stock imagery), so faces/hands are never
generated and no interface is presented as a real website capture.
"""
import functools
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
SS = 2  # supersampling for vector shapes

# ---------------------------------------------------------------- palette
# Brand colours sampled from the official logo (G = #6531DC, pin = #7219E3).
INK = (20, 20, 24)
PURPLE = (101, 49, 220)
PIN = (114, 25, 227)
DEEP = (52, 22, 128)
LAV = (206, 192, 250)
LILAC = (236, 230, 253)
CREAM = (244, 238, 227)
PAPER = (252, 249, 242)
KRAFT = (201, 168, 128)
TERRA = (214, 106, 72)
SAFFRON = (242, 182, 66)
TEAL = (30, 122, 110)
CHALK = (44, 72, 60)
GREEN = (52, 168, 96)
SKY = (120, 170, 230)
GREY = (196, 192, 204)
SHADOW = (38, 22, 52)

FONT_DIR = "/usr/share/fonts/opentype/inter/"


@functools.lru_cache(None)
def font(name, size):
    return ImageFont.truetype(FONT_DIR + name, int(size))


BOLD = "InterDisplay-ExtraBold.otf"
BLACK = "InterDisplay-Black.otf"
SEMI = "InterDisplay-SemiBold.otf"
MED = "InterDisplay-Medium.otf"

# ---------------------------------------------------------------- easing


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def prog(t, t0, d):
    return clamp((t - t0) / d)


def eo(x):
    return 1 - (1 - x) ** 3


def eio(x):
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def eob(x, s=1.6):
    x = clamp(x) - 1
    return 1 + (s + 1) * x ** 3 + s * x ** 2


def lerp(a, b, x):
    return a + (b - a) * x


def hsh(a, b):
    v = math.sin(a * 12.9898 + b * 78.233) * 43758.5453
    return (v - math.floor(v)) * 2 - 1


# ---------------------------------------------------------------- textures


def _make_grain(w, h, seed=3):
    r = np.random.default_rng(seed)
    fine = r.normal(0, 1, (h, w)).astype(np.float32)
    fine = np.array(Image.fromarray(np.clip(128 + fine * 50, 0, 255).astype(np.uint8))
                    .filter(ImageFilter.GaussianBlur(0.7)), np.float32) - 128
    co = r.normal(0, 1, (h // 10 + 1, w // 10 + 1))
    co = np.array(Image.fromarray(np.clip(128 + co * 50, 0, 255).astype(np.uint8))
                  .resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6)), np.float32) - 128
    g = fine / (fine.std() + 1e-6) * 0.55 + co / (co.std() + 1e-6) * 0.45
    # paper fibres
    im = Image.new("L", (w, h), 128)
    d = ImageDraw.Draw(im)
    for _ in range(w * h // 2500):
        x, y = r.uniform(0, w), r.uniform(0, h)
        a = r.uniform(0, math.pi)
        L = r.uniform(6, 22)
        v = int(128 + r.choice([-1, 1]) * r.uniform(20, 45))
        d.line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], fill=v, width=1)
    fib = np.array(im.filter(ImageFilter.GaussianBlur(0.5)), np.float32) - 128
    return (g + fib / 40.0).astype(np.float32)


GRAIN = _make_grain(W, H)


def grain_crop(w, h, seed):
    r = np.random.default_rng(seed)
    g = GRAIN
    if w > W or h > H:
        g = np.tile(GRAIN, (h // H + 1, w // W + 1))
    oy = int(r.integers(0, g.shape[0] - h + 1))
    ox = int(r.integers(0, g.shape[1] - w + 1))
    return g[oy:oy + h, ox:ox + w]


def texturize(img, strength=0.05, seed=0):
    a = np.array(img).astype(np.float32)
    g = grain_crop(a.shape[1], a.shape[0], seed)
    a[..., :3] *= (1 + strength * g)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


def noise1d(n, seed, smooth=24, mix=0.55):
    r = np.random.default_rng(seed)
    lo = r.normal(0, 1, n + smooth * 6)
    k = np.hanning(smooth * 2 + 1)
    k /= k.sum()
    lo = np.convolve(lo, k, "same")[smooth * 3:smooth * 3 + n]
    lo /= lo.std() + 1e-6
    hi = r.normal(0, 1, n)
    return mix * lo + (1 - mix) * hi * 0.6


def halftone(w, h, bg, dot, cell=9, rmin=0.6, rmax=3.2, grad=True):
    """Print-style halftone fill (supersampled sizes)."""
    im = Image.new("RGBA", (w, h), bg + (255,))
    d = ImageDraw.Draw(im)
    for j, y in enumerate(range(0, h + cell, cell)):
        off = cell / 2 if j % 2 else 0
        rr = lerp(rmin, rmax, y / h) if grad else rmax
        for x in np.arange(off, w + cell, cell):
            d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=dot + (255,))
    return im


# ---------------------------------------------------------------- sprites


class Spr:
    """Centre-anchored RGBA sprite with a soft paper drop shadow."""

    def __init__(self, img, shadow=0.34, blur=9):
        self.img = img
        self.shadow = shadow
        self.cache = {}
        self.sh = None
        if shadow:
            p = blur * 2 + 2
            sh = Image.new("L", (img.width + 2 * p, img.height + 2 * p), 0)
            sh.paste(img.getchannel("A"), (p, p))
            self.sh = sh.filter(ImageFilter.GaussianBlur(blur))

    @property
    def w(self):
        return self.img.width

    @property
    def h(self):
        return self.img.height

    def tf(self, sx, sy, rot):
        key = (round(sx, 3), round(sy, 3), round(rot, 1))
        c = self.cache.get(key)
        if c is not None:
            return c
        im, sh = self.img, self.sh
        if key[:2] != (1, 1):
            im = im.resize((max(1, round(im.width * sx)), max(1, round(im.height * sy))), Image.BICUBIC)
            if sh is not None:
                sh = sh.resize((max(1, round(sh.width * sx)), max(1, round(sh.height * sy))), Image.BILINEAR)
        if key[2]:
            im = im.convert("RGBa").rotate(key[2], Image.BICUBIC, expand=True).convert("RGBA")
            if sh is not None:
                sh = sh.rotate(key[2], Image.BILINEAR, expand=True)
        if len(self.cache) > 260:
            self.cache.clear()
        self.cache[key] = (im, sh)
        return im, sh


CLOCK = {"t": 0.0}


def paste(cv, im, x, y):
    x, y = int(round(x)), int(round(y))
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(cv.width, x + im.width), min(cv.height, y + im.height)
    if x1 <= x0 or y1 <= y0:
        return
    if (x0, y0, x1, y1) != (x, y, x + im.width, y + im.height):
        im = im.crop((x0 - x, y0 - y, x1 - x, y1 - y))
    cv.alpha_composite(im, (x0, y0))


def with_opacity(im, op):
    if op >= 0.999:
        return im
    im = im.copy()
    im.putalpha(im.getchannel("A").point(lambda v: int(v * op)))
    return im


def put(cv, spr, x, y, sc=1.0, rot=0.0, op=1.0, lift=1.0, sx=1.0, sy=1.0, j=None):
    """Composite a sprite centred at (x, y). `j` adds stop-motion jitter (12 fps)."""
    if op <= 0.004 or sc <= 0.01 or abs(sx * sc) < 0.005 or abs(sy * sc) < 0.005:
        return
    if j is not None:
        k = int(CLOCK["t"] * 12)
        x += hsh(j, k) * 1.4
        y += hsh(j + 7.3, k) * 1.4
        rot += hsh(j + 3.1, k) * 0.25
    im, sh = spr.tf(sx * sc, sy * sc, rot)
    if sh is not None and lift > 0:
        amul = spr.shadow * op * min(1.0, lift)
        blk = Image.new("RGBA", sh.size, SHADOW + (0,))
        blk.putalpha(sh.point(lambda v: int(v * amul)))
        paste(cv, blk, x + 5 * lift * sc - sh.width / 2, y + 11 * lift * sc - sh.height / 2)
    paste(cv, with_opacity(im, op), x - im.width / 2, y - im.height / 2)


# ---------------------------------------------------------------- drawing pad


class Pad:
    def __init__(self, w, h):
        self.w, self.h = int(w), int(h)
        self.im = Image.new("RGBA", (self.w * SS, self.h * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    @staticmethod
    def S(box):
        return [v * SS for v in box]

    def ell(self, box, fill=None, outline=None, width=0):
        self.d.ellipse(self.S(box), fill=fill, outline=outline, width=int(width * SS))

    def rect(self, box, fill=None, r=0, outline=None, width=0):
        self.d.rounded_rectangle(self.S(box), radius=r * SS, fill=fill, outline=outline, width=int(width * SS))

    def poly(self, pts, fill):
        self.d.polygon([(x * SS, y * SS) for x, y in pts], fill=fill)

    def line(self, pts, fill, width):
        self.d.line([(x * SS, y * SS) for x, y in pts], fill=fill, width=int(width * SS), joint="curve")
        r = width * SS / 2
        for x, y in (pts[0], pts[-1]):
            self.d.ellipse((x * SS - r, y * SS - r, x * SS + r, y * SS + r), fill=fill)

    def arc(self, box, a0, a1, fill, width):
        self.d.arc(self.S(box), a0, a1, fill=fill, width=int(width * SS))

    def chord(self, box, a0, a1, fill):
        self.d.chord(self.S(box), a0, a1, fill=fill)

    def text(self, xy, s, name, size, fill, anchor="mm"):
        self.d.text((xy[0] * SS, xy[1] * SS), s, font=font(name, size * SS), fill=fill, anchor=anchor)

    def fillmask(self, draw_fn, pattern):
        m = Image.new("L", self.im.size, 0)
        draw_fn(ImageDraw.Draw(m))
        self.im.paste(pattern.resize(self.im.size) if pattern.size != self.im.size else pattern, (0, 0), m)

    def done(self):
        return self.im.resize((self.w, self.h), Image.LANCZOS)


# ---------------------------------------------------------------- paper pieces


def _perimeter(x0, y0, x1, y1, step):
    P, N = [], []
    for x in np.arange(x0, x1, step):
        P.append((x, y0)); N.append((0, -1))
    for y in np.arange(y0, y1, step):
        P.append((x1, y)); N.append((1, 0))
    for x in np.arange(x1, x0, -step):
        P.append((x, y1)); N.append((0, 1))
    for y in np.arange(y1, y0, -step):
        P.append((x0, y)); N.append((-1, 0))
    return np.array(P, float), np.array(N, float)


def card(w, h, fill, seed=1, amp=1.4, fringe=0.0, fcol=PAPER, tex=0.05, pattern=None):
    """Paper card with hand-cut (amp small) or torn (amp large + fringe) edges.
    Returns (image, pad) – content origin is at (pad, pad)."""
    pad = int(amp * 3 + fringe * 2.5 + 6)
    CW, CH = w + 2 * pad, h + 2 * pad
    P, N = _perimeter(pad, pad, pad + w, pad + h, 3)
    n = len(P)
    out = Image.new("RGBA", (CW, CH), fill + (0,))
    if fringe > 0:
        f = noise1d(n, seed + 7, smooth=8, mix=0.35)
        Q = P + N * (fringe * (0.5 + 0.8 * np.abs(f)))[:, None]
        m = Image.new("L", (CW * SS, CH * SS), 0)
        ImageDraw.Draw(m).polygon([(a * SS, b * SS) for a, b in Q], fill=255)
        m = m.resize((CW, CH), Image.LANCZOS)
        out.paste(Image.new("RGBA", (CW, CH), fcol + (255,)), (0, 0), m)
    Q = P + N * (noise1d(n, seed) * amp)[:, None]
    m = Image.new("L", (CW * SS, CH * SS), 0)
    ImageDraw.Draw(m).polygon([(a * SS, b * SS) for a, b in Q], fill=255)
    m = m.resize((CW, CH), Image.LANCZOS)
    src = Image.new("RGBA", (CW, CH), fill + (255,)) if pattern is None else pattern.resize((CW, CH))
    out.paste(src, (0, 0), m)
    return texturize(out, tex, seed), pad


def torn_blob(r, fill, seed=1, amp=10, fringe=7, fcol=PAPER, sx=1.0, sy=1.0, tex=0.05):
    """Torn-paper disc / ellipse."""
    pad = int(amp * 2 + fringe * 2 + 8)
    w, h = int(2 * r * sx + 2 * pad), int(2 * r * sy + 2 * pad)
    n = 720
    a = np.linspace(0, 2 * np.pi, n, endpoint=False)
    out = Image.new("RGBA", (w, h), fill + (0,))
    for layer, (off, col, sd) in enumerate(((fringe, fcol, seed + 5), (0, fill, seed))):
        if layer == 0 and fringe <= 0:
            continue
        nz = noise1d(n, sd, smooth=14, mix=0.6) * amp
        rr = r + nz + (np.abs(noise1d(n, sd + 1, 6, 0.3)) * off if off else 0)
        pts = [((w / 2 + math.cos(t) * q * sx) * SS, (h / 2 + math.sin(t) * q * sy) * SS) for t, q in zip(a, rr)]
        m = Image.new("L", (w * SS, h * SS), 0)
        ImageDraw.Draw(m).polygon(pts, fill=255)
        out.paste(Image.new("RGBA", (w, h), col + (255,)), (0, 0), m.resize((w, h), Image.LANCZOS))
    return texturize(out, tex, seed)


def sticker(img, border=8, col=PAPER, seed=0, tex=0.04):
    """Cut-out with a white paper border, like scissor-cut magazine collage."""
    pad = border + 6
    big = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), col + (0,))
    big.paste(img, (pad, pad))
    a = big.getchannel("A")
    d = a.filter(ImageFilter.GaussianBlur(border * 0.55)).point(lambda v: 255 if v > 6 else v * 42)
    d = d.filter(ImageFilter.GaussianBlur(0.8))
    out = Image.new("RGBA", big.size, col + (0,))
    out.putalpha(d)
    out.alpha_composite(big)
    return texturize(out, tex, seed)


def strip(text, size, fg, bg, name=BOLD, padx=30, pady=16, seed=0, amp=1.6, fringe=0.0):
    f = font(name, size)
    tw = f.getlength(text)
    w, h = int(tw + 2 * padx), int(size * 1.18 + 2 * pady)
    im, p = card(w, h, bg, seed=seed, amp=amp, fringe=fringe)
    ImageDraw.Draw(im).text((p + w / 2, p + h / 2 + size * 0.02), text, font=f, fill=fg, anchor="mm")
    return im


def label_txt(text, size, fg, name=BOLD):
    f = font(name, size)
    tw = int(f.getlength(text)) + 12
    im = Image.new("RGBA", (tw, int(size * 1.4)), fg + (0,))
    ImageDraw.Draw(im).text((tw / 2, size * 0.7), text, font=f, fill=fg, anchor="mm")
    return im


def dot_sprite(r, col):
    p = Pad(2 * r + 2, 2 * r + 2)
    p.ell((1, 1, 2 * r + 1, 2 * r + 1), fill=col)
    return p.done()


def dotted_line(cv, dot, x0, y0, x1, y1, frac=1.0, gap=16, op=1.0):
    L = math.hypot(x1 - x0, y1 - y0)
    n = int(L * frac / gap)
    im = with_opacity(dot, op)
    for i in range(n + 1):
        u = i * gap / L
        paste(cv, im, x0 + (x1 - x0) * u - dot.width / 2, y0 + (y1 - y0) * u - dot.height / 2)


def stroke_path(cv, dot, pts, frac=1.0, gap=3):
    """Draw an anti-aliased stroke along a polyline (by stamping a dot), up to `frac`."""
    seg = [math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) for i in range(len(pts) - 1)]
    total = sum(seg) * frac
    acc = 0.0
    for i, L in enumerate(seg):
        if acc >= total:
            break
        use = min(L, total - acc)
        n = max(1, int(use / gap))
        for k in range(n + 1):
            u = k * use / n / L if L else 0
            x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u
            y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u
            paste(cv, dot, x - dot.width / 2, y - dot.height / 2)
        acc += L


# ---------------------------------------------------------------- logo


@functools.lru_cache(None)
def logo():
    src = Image.open(os.path.join(HERE, "assets", "logo_source.png")).convert("RGB").crop((40, 70, 965, 306))
    a = np.array(src).astype(np.float32)
    mn = a.min(axis=2)
    al = np.clip((255 - mn) * 1.7 / 255, 0, 1)
    col = np.where(al[..., None] > 0.01, (a - 255 * (1 - al[..., None])) / np.maximum(al[..., None], 0.01), 0)
    out = np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def logo_w(w):
    L = logo()
    return L.resize((int(w), int(L.height * w / L.width)), Image.LANCZOS)


# ---------------------------------------------------------------- people (faceless editorial cut-outs)

SKINS = [(196, 140, 104), (168, 114, 82), (224, 178, 140), (140, 94, 66), (210, 160, 120)]


def _shade(c, k):
    return tuple(int(clamp(v * k, 0, 255)) for v in c)


def teacher():
    """Teacher bust (600 x 760): dark hair in a bun, round glasses, purple blazer."""
    w, h = 600, 760
    p = Pad(w, h)
    HAIR, SKIN = (40, 27, 30), SKINS[0]
    SD = _shade(SKIN, 0.86)
    p.rect((168, 95, 432, 455), HAIR, r=120)
    p.ell((250, 38, 350, 132), HAIR)
    p.rect((262, 320, 338, 470), SD, r=24)
    ht = halftone(w * SS, h * SS, PURPLE, (84, 36, 196), cell=16, rmin=1.5, rmax=5.5)
    p.fillmask(lambda d: d.rounded_rectangle((60 * SS, 438 * SS, 540 * SS, 1060 * SS), radius=170 * SS, fill=255), ht)
    p.poly([(236, 438), (364, 438), (300, 590)], PAPER)
    lap = (72, 28, 170)
    p.poly([(236, 440), (300, 590), (262, 650), (168, 470)], lap)
    p.poly([(364, 440), (300, 590), (338, 650), (432, 470)], lap)
    p.ell((382, 520, 398, 536), SAFFRON)  # brooch
    p.ell((196, 232, 224, 292), SKIN)
    p.ell((376, 232, 404, 292), SKIN)
    p.ell((205, 132, 395, 372), SKIN)
    p.chord((193, 106, 407, 300), 180, 360, HAIR)
    p.ell((212, 150, 318, 236), HAIR)
    p.ell((203, 292, 219, 308), SAFFRON)
    p.ell((381, 292, 397, 308), SAFFRON)
    p.ell((232, 222, 292, 280), outline=INK, width=5)
    p.ell((308, 222, 368, 280), outline=INK, width=5)
    p.line([(292, 250), (308, 250)], INK, 5)
    p.line([(301, 262), (295, 300), (306, 303)], SD, 4)
    p.arc((272, 300, 328, 340), 25, 155, (122, 58, 52), 5)
    return p.done()


def student_boy():
    w, h = 470, 560
    p = Pad(w, h)
    SKIN = SKINS[1]
    HAIR = (30, 22, 20)
    p.rect((200, 250, 270, 350), _shade(SKIN, 0.86), r=20)
    ht = halftone(w * SS, h * SS, SAFFRON, (214, 146, 40), cell=14, rmin=1.2, rmax=4.6)
    p.fillmask(lambda d: d.rounded_rectangle((40 * SS, 320 * SS, 430 * SS, 820 * SS), radius=150 * SS, fill=255), ht)
    p.ell((160, 300, 310, 380), (226, 160, 50))  # hood
    p.line([(212, 350), (206, 430)], PAPER, 5)
    p.line([(258, 350), (264, 430)], PAPER, 5)
    p.ell((152, 160, 178, 210), SKIN)
    p.ell((292, 160, 318, 210), SKIN)
    p.ell((160, 85, 310, 290), SKIN)
    p.chord((154, 66, 316, 200), 180, 360, HAIR)
    p.poly([(160, 135), (230, 110), (312, 140), (300, 108), (200, 80)], HAIR)
    p.arc((212, 228, 258, 262), 25, 155, (110, 52, 44), 5)
    return p.done()


def student_girl():
    w, h = 470, 560
    p = Pad(w, h)
    SKIN = SKINS[2]
    ht = halftone(w * SS, h * SS, (124, 172, 226), (92, 140, 204), cell=14, rmin=1.2, rmax=4.6)
    p.fillmask(lambda d: d.rounded_rectangle((40 * SS, 330 * SS, 430 * SS, 830 * SS), radius=150 * SS, fill=255), ht)
    p.poly([(120, 230), (350, 230), (390, 400), (235, 440), (80, 400)], TEAL)  # scarf drape
    p.ell((128, 58, 342, 312), TEAL)
    p.ell((168, 96, 302, 284), SKIN)
    p.arc((168, 70, 302, 140), 200, 340, _shade(TEAL, 0.8), 6)
    p.arc((212, 222, 258, 256), 25, 155, (122, 58, 52), 5)
    return p.done()


def mini_person(seed, d=120):
    """Small circular avatar badge of a generic student."""
    r = np.random.default_rng(seed)
    p = Pad(d, d)
    bgs = [LILAC, (255, 233, 200), (214, 238, 230), (226, 236, 252), (252, 222, 214)]
    p.ell((0, 0, d, d), bgs[seed % len(bgs)])
    skin = SKINS[int(r.integers(0, len(SKINS)))]
    cloth = [PURPLE, SAFFRON, TEAL, TERRA, SKY, INK][int(r.integers(0, 6))]
    m = Image.new("L", (d * SS, d * SS), 0)
    md = ImageDraw.Draw(m)
    md.ellipse((0, 0, d * SS, d * SS), fill=255)
    body = Image.new("RGBA", (d * SS, d * SS), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle((d * 0.16 * SS, d * 0.68 * SS, d * 0.84 * SS, d * 1.3 * SS), radius=d * 0.3 * SS, fill=cloth)
    kind = seed % 3
    hx0, hy0, hx1, hy1 = d * .33, d * .2, d * .67, d * .66
    if kind == 2:  # head scarf
        bd.ellipse((d * .26 * SS, d * .14 * SS, d * .74 * SS, d * .72 * SS), fill=[TEAL, DEEP, TERRA][seed % 3])
        bd.ellipse(((hx0 + 4) * SS, (hy0 + 6) * SS, (hx1 - 4) * SS, (hy1 - 2) * SS), fill=skin)
    else:
        bd.ellipse((hx0 * SS, hy0 * SS, hx1 * SS, hy1 * SS), fill=skin)
        hair = (36, 26, 24) if seed % 2 else (70, 44, 30)
        bd.chord((hx0 * SS - 4, hy0 * SS - 8, hx1 * SS + 4, (hy0 + d * .26) * SS), 180, 360, fill=hair)
    p.im.paste(body, (0, 0), Image.composite(body.getchannel("A"), Image.new("L", m.size, 0), m))
    return p.done()


def circle_crop(img, box, d, ring=PAPER, ringw=8, bg=LILAC):
    c = img.crop(box).resize((d, d), Image.LANCZOS)
    p = Pad(d + 2 * ringw, d + 2 * ringw)
    p.ell((0, 0, d + 2 * ringw, d + 2 * ringw), ring)
    p.ell((ringw, ringw, d + ringw, d + ringw), bg)
    out = p.done()
    m = Image.new("L", (d * SS, d * SS), 0)
    ImageDraw.Draw(m).ellipse((0, 0, d * SS, d * SS), fill=255)
    m = m.resize((d, d), Image.LANCZOS)
    m = Image.fromarray((np.array(m, np.float32) * np.array(c.getchannel("A"), np.float32) / 255).astype(np.uint8))
    out.paste(c, (ringw, ringw), m)
    return out


def teacher_avatar(d=200, ring=PAPER):
    return circle_crop(teacher(), (125, 20, 475, 370), d, ring=ring)


# ---------------------------------------------------------------- objects & icons


def icon(name, s=100, col=INK, bg=None):
    p = Pad(s, s)
    u = s / 100
    if bg is not None:
        p.ell((0, 0, s, s), bg)
    lw = 7 * u

    def L(pts, w=lw, c=col):
        p.line([(x * u, y * u) for x, y in pts], c, w)

    if name == "cap":
        p.poly([(50 * u, 22 * u), (88 * u, 40 * u), (50 * u, 58 * u), (12 * u, 40 * u)], col)
        p.rect((30 * u, 46 * u, 70 * u, 70 * u), col, r=6 * u)
        L([(80, 44), (80, 68)], 4 * u)
        p.ell((75 * u, 66 * u, 85 * u, 76 * u), SAFFRON)
    elif name == "case":
        p.rect((18 * u, 34 * u, 82 * u, 78 * u), col, r=8 * u)
        p.rect((38 * u, 22 * u, 62 * u, 38 * u), None, r=5 * u, outline=col, width=6 * u)
        p.rect((18 * u, 50 * u, 82 * u, 54 * u), bg or PAPER)
    elif name == "bulb":
        p.ell((28 * u, 14 * u, 72 * u, 58 * u), col)
        p.rect((38 * u, 54 * u, 62 * u, 72 * u), col, r=4 * u)
        p.rect((40 * u, 76 * u, 60 * u, 84 * u), col, r=3 * u)
    elif name == "book":
        p.poly([(14 * u, 26 * u), (48 * u, 32 * u), (48 * u, 80 * u), (14 * u, 74 * u)], col)
        p.poly([(86 * u, 26 * u), (52 * u, 32 * u), (52 * u, 80 * u), (86 * u, 74 * u)], col)
    elif name == "share":
        for a, b in (((30, 50), (70, 26)), ((30, 50), (70, 74))):
            L([a, b], 6 * u)
        for cx, cy in ((30, 50), (70, 26), (70, 74)):
            p.ell(((cx - 12) * u, (cy - 12) * u, (cx + 12) * u, (cy + 12) * u), col)
    elif name == "link":
        p.rect((12 * u, 36 * u, 56 * u, 64 * u), None, r=14 * u, outline=col, width=7 * u)
        p.rect((44 * u, 36 * u, 88 * u, 64 * u), None, r=14 * u, outline=col, width=7 * u)
    elif name == "chat":
        p.rect((14 * u, 20 * u, 86 * u, 70 * u), col, r=18 * u)
        p.poly([(26 * u, 64 * u), (24 * u, 86 * u), (46 * u, 68 * u)], col)
        for cx in (34, 50, 66):
            p.ell(((cx - 5) * u, 40 * u, (cx + 5) * u, 50 * u), bg or PAPER)
    elif name == "mail":
        p.rect((14 * u, 26 * u, 86 * u, 74 * u), col, r=8 * u)
        L([(18, 32), (50, 54), (82, 32)], 6 * u, bg or PAPER)
    elif name == "eye":
        p.poly([(10 * u, 50 * u)] + [((50 + 40 * math.cos(a)) * u, (50 - 26 * math.sin(a)) * u)
                                       for a in np.linspace(0, math.pi, 16)] +
               [((50 + 40 * math.cos(a)) * u, (50 + 26 * math.sin(a)) * u) for a in np.linspace(math.pi, 0, 16)], col)
        p.ell((34 * u, 34 * u, 66 * u, 66 * u), bg or PAPER)
        p.ell((42 * u, 42 * u, 58 * u, 58 * u), col)
    elif name == "pin":
        p.ell((24 * u, 10 * u, 76 * u, 62 * u), col)
        p.poly([(29 * u, 48 * u), (71 * u, 48 * u), (50 * u, 90 * u)], col)
        p.ell((38 * u, 24 * u, 62 * u, 48 * u), bg or PAPER)
    elif name == "check":
        L([(28, 52), (44, 68), (74, 34)], 10 * u)
    elif name == "video":
        p.rect((12 * u, 30 * u, 66 * u, 70 * u), col, r=8 * u)
        p.poly([(68 * u, 50 * u), (88 * u, 34 * u), (88 * u, 66 * u)], col)
    elif name == "house":
        p.poly([(50 * u, 14 * u), (88 * u, 46 * u), (12 * u, 46 * u)], col)
        p.rect((22 * u, 44 * u, 78 * u, 84 * u), col, r=4 * u)
        p.rect((42 * u, 58 * u, 58 * u, 84 * u), bg or PAPER, r=3 * u)
    elif name == "user":
        p.ell((34 * u, 16 * u, 66 * u, 48 * u), col)
        p.rect((18 * u, 54 * u, 82 * u, 90 * u), col, r=24 * u)
    return p.done()


def notebook(w=260, h=330, col=TERRA, seed=0):
    im, pd = card(w, h, PAPER, seed=seed, amp=1.0)
    d = ImageDraw.Draw(im)
    d.rectangle((pd, pd, pd + w, pd + 46), fill=col)
    for y in range(pd + 80, pd + h - 20, 30):
        d.line((pd + 24, y, pd + w - 20, y), fill=(170, 186, 220), width=2)
    d.line((pd + 52, pd + 46, pd + 52, pd + h), fill=(232, 140, 140), width=2)
    p = Pad(im.width, im.height)
    for x in range(pd + 26, pd + w - 10, 30):
        p.ell((x - 7, pd - 12, x + 7, pd + 12), None, outline=(90, 90, 100), width=4)
    im.alpha_composite(p.done())
    return im


def book(w=280, h=64, col=PURPLE, seed=0):
    p = Pad(w + 4, h + 4)
    p.rect((2, 2, w + 2, h + 2), col, r=8)
    p.rect((w - 30, 8, w - 4, h - 4), PAPER, r=3)
    for x in (30, 48):
        p.rect((x, 2, x + 6, h + 2), _shade(col, 0.75))
    return texturize(p.done(), 0.05, seed)


def book_stack(seed=0):
    cols = [PURPLE, SAFFRON, TEAL, TERRA]
    im = Image.new("RGBA", (330, 250), (0, 0, 0, 0))
    for i, c in enumerate(cols[:3]):
        b = book(280 - i * 22, 62, c, seed + i).rotate([2, -3, 1.5][i], Image.BICUBIC, expand=True)
        im.alpha_composite(b, (20 + i * 9, 250 - 70 * (i + 1) - b.height // 3))
    return im


def lesson_card(title, col, w=300, h=200, seed=0, formula=None):
    im, pd = card(w, h, PAPER, seed=seed, amp=1.2)
    d = ImageDraw.Draw(im)
    d.rectangle((pd, pd, pd + w, pd + 50), fill=col)
    d.text((pd + 20, pd + 25), title, font=font(BOLD, 26), fill=PAPER, anchor="lm")
    if formula:
        d.text((pd + w / 2, pd + 120), formula, font=font(SEMI, 38), fill=INK, anchor="mm")
    else:
        for i, y in enumerate(range(pd + 80, pd + h - 20, 30)):
            d.rounded_rectangle((pd + 20, y, pd + w - 20 - (i % 2) * 70, y + 12), radius=6, fill=(214, 210, 222))
    return im


def math_sticker(sym, col, size=120, seed=0):
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    tw = int(f.getlength(sym)) + 20
    im = Image.new("RGBA", (tw, int(size * 1.35)), col + (0,))
    ImageDraw.Draw(im).text((tw / 2, size * 0.68), sym, font=f, fill=col, anchor="mm")
    return sticker(im, border=9, seed=seed)


def chalkboard(w=760, h=500):
    p = Pad(w, h)
    p.rect((0, 0, w, h), (150, 102, 62), r=12)
    p.rect((18, 18, w - 18, h - 18), CHALK, r=6)
    out = texturize(p.done(), 0.09, 4)
    d = ImageDraw.Draw(out)
    ch = (232, 236, 226)
    d.text((70, 110), "a² + b² = c²", font=font(MED, 58), fill=ch, anchor="lm")
    d.text((70, 210), "y = ax + b", font=font(MED, 50), fill=ch, anchor="lm")
    q = Pad(w, h)
    q.line([(480, 330), (680, 330), (480, 150), (480, 330)], ch, 4)
    q.rect((480, 306, 504, 330), None, outline=ch, width=3)
    q.line([(70, 330), (140, 300), (210, 350), (300, 290), (380, 320)], ch, 4)
    out.alpha_composite(q.done())
    tray = Pad(w, h)
    tray.rect((60, h - 36, w - 60, h - 20), (120, 80, 48), r=4)
    tray.rect((120, h - 46, 180, h - 36), PAPER, r=3)
    out.alpha_composite(tray.done())
    return out


def laptop(w=760, h=480, screen_col=(250, 250, 255)):
    """Returns (image, screen box in image coords)."""
    p = Pad(w, h)
    p.rect((50, 0, w - 50, h - 50), INK, r=22)
    p.rect((68, 18, w - 68, h - 68), screen_col, r=8)
    p.poly([(0, h - 40), (w, h - 40), (w - 30, h), (30, h)], (196, 198, 210))
    p.rect((0, h - 48, w, h - 34), (216, 218, 228), r=7)
    p.rect((w / 2 - 60, h - 46, w / 2 + 60, h - 38), (170, 172, 186), r=4)
    return p.done(), (68, 18, w - 68, h - 68)


def phone(content, w=420, h=860):
    p = Pad(w, h)
    p.rect((0, 0, w, h), INK, r=58)
    p.rect((4, 4, w - 4, h - 4), None, r=55, outline=(70, 70, 80), width=3)
    out = p.done()
    sw, sh = w - 32, h - 32
    c = content.resize((sw, sh), Image.LANCZOS)
    m = Image.new("L", (sw * SS, sh * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, sw * SS, sh * SS), radius=44 * SS, fill=255)
    out.paste(c, (16, 16), m.resize((sw, sh), Image.LANCZOS))
    q = Pad(w, h)
    q.rect((w / 2 - 50, 30, w / 2 + 50, 56), INK, r=13)
    out.alpha_composite(q.done())
    return out


def chip(text, size, fg, bg, padx=22, pady=10):
    f = font(SEMI, size)
    w = int(f.getlength(text) + 2 * padx)
    h = int(size * 1.2 + 2 * pady)
    p = Pad(w, h)
    p.rect((0, 0, w, h), bg, r=h / 2)
    im = p.done()
    ImageDraw.Draw(im).text((w / 2, h / 2), text, font=f, fill=fg, anchor="mm")
    return im


def profile_ui(w=480, h=980, share=True):
    """Stylised (illustrative, not a website capture) teacher profile screen.
    Returns (image, share-button centre or None)."""
    u = w / 480
    im = Image.new("RGBA", (w, h), (252, 251, 255, 255))
    p = Pad(w, h)
    p.rect((0, 0, w, 215 * u), PURPLE)
    for cx, cy, r in ((60, 40, 70), (420, 160, 90), (300, 20, 40)):
        p.ell(((cx - r) * u, (cy - r) * u, (cx + r) * u, (cy + r) * u), (122, 74, 232))
    im.alpha_composite(p.done())
    av = teacher_avatar(int(170 * u))
    im.alpha_composite(av, (int(w / 2 - av.width / 2), int(215 * u - av.height / 2)))
    q = Pad(w, h)
    q.rect((w / 2 - 110 * u, 330 * u, w / 2 + 110 * u, 352 * u), INK, r=11 * u)
    q.rect((w / 2 - 75 * u, 366 * u, w / 2 + 75 * u, 382 * u), GREY, r=8 * u)
    rows = ["cap", "case", "bulb", "pin"]
    for i, nm in enumerate(rows):
        y = (490 + i * 82) * u
        q.ell((36 * u, y - 26 * u, 88 * u, y + 26 * u), LILAC)
        q.rect((108 * u, y - 16 * u, (330 - (i % 2) * 60) * u, y - 2 * u), (70, 66, 84), r=7 * u)
        q.rect((108 * u, y + 8 * u, (420 - (i % 3) * 40) * u, y + 20 * u), (214, 210, 222), r=6 * u)
    btn = None
    if share:
        by = h - 92 * u
        q.rect((40 * u, by - 40 * u, w - 40 * u, by + 40 * u), PURPLE, r=40 * u)
        btn = (w / 2, by)
    im.alpha_composite(q.done())
    for i, nm in enumerate(rows):
        y = (490 + i * 82) * u
        ic = icon(nm, int(34 * u), PURPLE)
        im.alpha_composite(ic, (int(62 * u - ic.width / 2), int(y - ic.height / 2)))
    c1 = chip("Mathématiques", int(20 * u), PURPLE, LILAC)
    c2 = chip("Physique", int(20 * u), PURPLE, LILAC)
    gx = int(w / 2 - (c1.width + c2.width + 12 * u) / 2)
    im.alpha_composite(c1, (gx, int(404 * u)))
    im.alpha_composite(c2, (int(gx + c1.width + 12 * u), int(404 * u)))
    if share:
        d = ImageDraw.Draw(im)
        f = font(BOLD, int(28 * u))
        txt = "Partager mon profil"
        tw = f.getlength(txt)
        ic = icon("share", int(40 * u), PAPER)
        x0 = w / 2 - (tw + ic.width + 10 * u) / 2
        im.alpha_composite(ic, (int(x0), int(btn[1] - ic.height / 2)))
        d.text((x0 + ic.width + 10 * u, btn[1]), txt, font=f, fill=PAPER, anchor="lm")
    return im, btn
