# Procedural cut-out collage assets for the Animedia Studio promo
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

W, H = 1080, 1920
BG = (11, 9, 18)
CHAR = (24, 20, 34)
VIOLET = (123, 47, 247)
PURPLE = (162, 60, 240)
MAGENTA = (198, 75, 255)
LAV = (205, 184, 255)
CREAM = (238, 231, 219)
RIM = (246, 242, 234)
WHITE = (255, 255, 255)
INK = (16, 12, 24)

F_BLACK = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
F_BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
F_MED = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
F_SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_SERIF_I = "/usr/share/fonts/truetype/crosextra/Caladea-Italic.ttf"
F_SERIF_BI = "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf"
_fc = {}
def font(path, size):
    k = (path, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(path, size)
    return _fc[k]

def rgba(w, h, c=(0, 0, 0, 0)): return Image.new("RGBA", (int(w), int(h)), c)

def grain(img, amt=0.07, seed=0):
    a = np.asarray(img).astype(np.float32)
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 1, a.shape[:2])[..., None]
    a[..., :3] *= (1 + n * amt)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), img.mode)

def grad(w, h, c1, c2, angle=90):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    r = math.radians(angle)
    t = (x * math.cos(r) + y * math.sin(r))
    t = (t - t.min()) / max(1e-6, t.max() - t.min())
    c1 = np.array(c1, np.float32); c2 = np.array(c2, np.float32)
    a = c1 + (c2 - c1) * t[..., None]
    return Image.fromarray(a.astype(np.uint8), "RGB").convert("RGBA")

def torn_mask(w, h, amp=7, seed=0, margin=None, sides="trbl"):
    rnd = random.Random(seed)
    m = amp * 2 if margin is None else margin
    def edge(p0, p1, rough):
        L = math.dist(p0, p1); n = max(2, int(L / 5))
        pts = []; walk = 0
        for i in range(n + 1):
            t = i / n
            walk = walk * 0.85 + rnd.uniform(-1, 1) * amp * 0.6
            off = (walk + rnd.uniform(-1, 1) * amp * 0.35) if rough else 0
            x = p0[0] + (p1[0] - p0[0]) * t; y = p0[1] + (p1[1] - p0[1]) * t
            dx, dy = (p1[1] - p0[1]) / L, -(p1[0] - p0[0]) / L
            pts.append((x + dx * off, y + dy * off))
        return pts
    c = [(m, m), (w - m, m), (w - m, h - m), (m, h - m)]
    pts = edge(c[0], c[1], "t" in sides) + edge(c[1], c[2], "r" in sides) + \
        edge(c[2], c[3], "b" in sides) + edge(c[3], c[0], "l" in sides)
    im = Image.new("L", (int(w), int(h)), 0)
    ImageDraw.Draw(im).polygon(pts, fill=255)
    return im.filter(ImageFilter.GaussianBlur(0.7))

def paper(w, h, color=CREAM, seed=0, amp=7, rim=True, sides="trbl", texture=0.06, fill=None, halftone=None):
    w, h = int(w), int(h)
    outer = torn_mask(w, h, amp, seed, sides=sides)
    inner = torn_mask(w, h, amp * 0.9, seed + 99, margin=amp * 2 + 5, sides=sides) if rim else outer
    base = fill.resize((w, h)) if fill is not None else rgba(w, h, color + (255,))
    if halftone:
        base = base.copy(); d = ImageDraw.Draw(base)
        hc, step = halftone
        for yy in range(0, h, step):
            for xx in range(0, w, step):
                r = step * 0.42 * (0.25 + 0.75 * (xx + yy) / (w + h))
                ox = step / 2 if (yy // step) % 2 else 0
                d.ellipse([xx + ox - r, yy - r, xx + ox + r, yy + r], fill=hc)
    out = rgba(w, h, RIM + (255,))
    out.paste(base, (0, 0), inner)
    out = grain(out, texture, seed)
    # fibers
    d = ImageDraw.Draw(out); rnd = random.Random(seed + 7)
    for _ in range(int(w * h / 9000)):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h); a = rnd.uniform(0, 6.28); L = rnd.uniform(4, 14)
        d.line([x, y, x + math.cos(a) * L, y + math.sin(a) * L], fill=(255, 255, 255, 40), width=1)
    out.putalpha(ImageChops.multiply(outer, out.getchannel("A")))
    return out

def sticker(img, r=9, color=RIM, seed=0):
    """white cut-out border around an RGBA illustration"""
    pad = r + 6
    big = rgba(img.width + 2 * pad, img.height + 2 * pad)
    big.alpha_composite(img, (pad, pad))
    a = big.getchannel("A").filter(ImageFilter.GaussianBlur(r * 0.6))
    a = a.point(lambda v: 255 if v > 18 else 0).filter(ImageFilter.GaussianBlur(0.8))
    # rough the outline slightly
    n = np.asarray(a).astype(np.float32)
    rng = np.random.default_rng(seed)
    n = n * (0.92 + 0.08 * rng.random(n.shape)) ; a = Image.fromarray(n.astype(np.uint8))
    out = rgba(big.width, big.height, color + (255,)); out.putalpha(a)
    out = grain(out, 0.04, seed)
    out.alpha_composite(big)
    return out

def shadow_of(img, blur=14, op=0.55):
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(blur))
    a = a.point(lambda v: int(v * op))
    s = rgba(img.width, img.height, (0, 0, 0, 255)); s.putalpha(a)
    return s

class Sprite:
    def __init__(self, img, shadow=True, blur=14, op=0.55):
        self.img = img
        self.sh = shadow_of(img, blur, op) if shadow else None

# ---------------------------------------------------------------- pseudo photos
def photo(w, h, kind="landscape", seed=0):
    rng = np.random.default_rng(seed); rnd = random.Random(seed)
    if kind == "landscape":
        im = grad(w, h, (44, 18, 92), (255, 150, 170), 90)
        d = ImageDraw.Draw(im)
        sx, sy, sr = w * 0.62, h * 0.52, w * 0.16
        glow = rgba(w, h); ImageDraw.Draw(glow).ellipse([sx - sr * 2.4, sy - sr * 2.4, sx + sr * 2.4, sy + sr * 2.4], fill=(255, 210, 200, 110))
        im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(w * 0.08)))
        d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 236, 220, 255))
        for k, col in enumerate([(92, 40, 140), (58, 22, 100), (30, 12, 58)]):
            base = h * (0.6 + k * 0.12); pts = [(0, h)]
            for x in range(0, w + 20, 20):
                pts.append((x, base - (math.sin(x / w * (3 + k) + seed + k) * 0.5 + 0.5) * h * (0.18 - k * 0.03) - rnd.uniform(0, 6)))
            pts.append((w, h)); d.polygon(pts, fill=col + (255,))
    elif kind == "portrait":
        im = grad(w, h, (70, 30, 140), (20, 10, 40), 120)
        g = rgba(w, h); ImageDraw.Draw(g).ellipse([w * 0.1, h * 0.05, w * 0.95, h * 0.8], fill=(200, 120, 255, 120))
        im.alpha_composite(g.filter(ImageFilter.GaussianBlur(w * 0.12)))
        prof = profile_mask(int(w * 0.85), int(h * 0.92))
        body = rgba(prof.width, prof.height, (14, 8, 26, 255)); body.putalpha(prof)
        rim = rgba(prof.width, prof.height, (230, 190, 255, 255))
        rim.putalpha(ImageChops.subtract(prof, ImageChops.offset(prof, -5, 3)))
        im.alpha_composite(body, (int(w * 0.02), int(h * 0.1)))
        im.alpha_composite(rim, (int(w * 0.02), int(h * 0.1)))
    elif kind == "city":
        im = grad(w, h, (30, 14, 70), (190, 90, 220), 90)
        d = ImageDraw.Draw(im); x = 0
        while x < w:
            bw = rnd.randint(int(w * 0.07), int(w * 0.16)); bh = rnd.uniform(0.3, 0.75) * h
            d.rectangle([x, h - bh, x + bw, h], fill=(18, 10, 34, 255))
            for wy in range(int(h - bh + 8), h - 6, 12):
                for wx in range(x + 5, x + bw - 5, 10):
                    if rnd.random() < 0.35: d.rectangle([wx, wy, wx + 4, wy + 5], fill=(255, 210, 150, 230))
            x += bw + rnd.randint(0, 6)
    elif kind == "product":
        im = grad(w, h, (236, 220, 255), (150, 100, 230), 100)
        b = bottle(int(w * 0.45), int(h * 0.75))
        im.alpha_composite(shadow_of(b, 10, 0.4), (int(w * 0.29), int(h * 0.2)))
        im.alpha_composite(b, (int(w * 0.27), int(h * 0.16)))
    else:  # abstract
        im = rgba(w, h, (20, 10, 40, 255)); g = rgba(w, h); d = ImageDraw.Draw(g)
        for _ in range(7):
            cx, cy, r = rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(0.2, 0.5) * w
            col = rnd.choice([VIOLET, MAGENTA, (60, 200, 255), LAV, PURPLE])
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (170,))
        im.alpha_composite(g.filter(ImageFilter.GaussianBlur(w * 0.09)))
    # photographic finish: vignette + grain
    y, x = np.mgrid[0:h, 0:w]
    v = 1 - 0.45 * (((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 2
    a = np.asarray(im).astype(np.float32); a[..., :3] *= v[..., None]
    a[..., :3] += rng.normal(0, 7, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")

def polaroid(w, h, kind, seed=0, caption=None):
    pw = int(w * 0.86); ph = int(h * 0.72)
    p = rgba(w, h, (247, 244, 238, 255)); p = grain(p, 0.03, seed)
    p.alpha_composite(photo(pw, ph, kind, seed), ((w - pw) // 2, (w - pw) // 2))
    if caption:
        f = font(F_SERIF_I, int(h * 0.07)); d = ImageDraw.Draw(p)
        d.text((w / 2, ph + (w - pw) / 2 + (h - ph - (w - pw) / 2) / 2), caption, font=f, fill=(60, 40, 90), anchor="mm")
    return p

def torn_photo(w, h, kind, seed=0, amp=9):
    return paper(w, h, seed=seed, amp=amp, fill=photo(w, h, kind, seed), texture=0.02)

# ---------------------------------------------------------------- silhouette
PROFILE = [(0.30, 0.05), (0.52, 0.0), (0.72, 0.08), (0.80, 0.22), (0.80, 0.33), (0.86, 0.40), (0.92, 0.47),
           (0.84, 0.50), (0.85, 0.54), (0.81, 0.565), (0.84, 0.60), (0.80, 0.66), (0.74, 0.72), (0.64, 0.76),
           (0.63, 0.86), (0.78, 0.93), (0.95, 1.0), (0.0, 1.0), (0.12, 0.92), (0.24, 0.84), (0.22, 0.66),
           (0.12, 0.48), (0.12, 0.28), (0.18, 0.13)]
def catmull(pts, n=10):
    out = []; P = pts
    for i in range(len(P)):
        p0, p1, p2, p3 = P[i - 1], P[i], P[(i + 1) % len(P)], P[(i + 2) % len(P)]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    return out
def profile_mask(w, h):
    s = 3; im = Image.new("L", (w * s, h * s), 0)
    ImageDraw.Draw(im).polygon([(x * w * s, y * h * s) for x, y in catmull(PROFILE)], fill=255)
    return im.resize((w, h), Image.LANCZOS)

def silhouette(w, h, seed=0):
    m = profile_mask(w, h)
    fill = grad(w, h, (150, 60, 245), (60, 16, 120), 60)
    d = ImageDraw.Draw(fill)
    for yy in range(0, h, 14):  # halftone shading
        for xx in range(0, w, 14):
            r = 5.5 * max(0, (yy / h) - 0.25)
            ox = 7 if (yy // 14) % 2 else 0
            d.ellipse([xx + ox - r, yy - r, xx + ox + r, yy + r], fill=(40, 10, 80, 255))
    out = rgba(w, h); out.paste(grain(fill, 0.08, seed), (0, 0), m)
    return sticker(out, 10, seed=seed)

# ---------------------------------------------------------------- objects
def rrect(d, box, r, **kw): d.rounded_rectangle(box, r, **kw)

def camera(w=420):
    h = int(w * 0.72); s = 3; W2, H2 = w * s, h * s
    im = rgba(W2, H2); d = ImageDraw.Draw(im)
    rrect(d, [W2 * 0.3, 0, W2 * 0.62, H2 * 0.3], 20 * s, fill=(36, 32, 46))
    rrect(d, [W2 * 0.06, H2 * 0.05, W2 * 0.22, H2 * 0.2], 10 * s, fill=(60, 54, 72))
    rrect(d, [0, H2 * 0.18, W2, H2], 34 * s, fill=(30, 27, 40))
    rrect(d, [0, H2 * 0.45, W2, H2 * 0.82], 0, fill=(52, 46, 64))
    for i in range(0, int(W2), 9 * s): d.line([i, H2 * 0.45, i, H2 * 0.82], fill=(44, 40, 56), width=2 * s)
    cx, cy = W2 * 0.5, H2 * 0.6
    for r, col in [(0.36, (16, 14, 22)), (0.31, (70, 64, 84)), (0.27, (12, 10, 18)), (0.2, (40, 20, 90)), (0.13, (90, 40, 190)), (0.06, (10, 6, 20))]:
        R = r * H2 * 1.05; d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=col)
    R = 0.07 * H2; d.ellipse([cx - R * 2.2, cy - R * 2.6, cx - R * 0.6, cy - R * 1.2], fill=(220, 200, 255, 200))
    d.ellipse([W2 * 0.8, H2 * 0.28, W2 * 0.9, H2 * 0.4], fill=MAGENTA)
    rrect(d, [W2 * 0.68, H2 * 0.08, W2 * 0.84, H2 * 0.2], 8 * s, fill=(70, 64, 84))
    return im.resize((w, h), Image.LANCZOS)

def monitor(w=620, inner=None):
    h = int(w * 0.78); im = rgba(w, h); d = ImageDraw.Draw(im)
    sh = int(h * 0.74)
    rrect(d, [0, 0, w, sh], 22, fill=(26, 22, 36))
    scr = inner if inner is not None else photo(w - 36, sh - 36, "abstract", 4)
    im.alpha_composite(scr.resize((w - 36, sh - 36)), (18, 18))
    d.polygon([(w * 0.42, sh), (w * 0.58, sh), (w * 0.62, h * 0.95), (w * 0.38, h * 0.95)], fill=(40, 36, 52))
    rrect(d, [w * 0.25, h * 0.93, w * 0.75, h], 8, fill=(30, 27, 40))
    return im

def play_icon(r=60, col=WHITE):
    im = rgba(r * 2, r * 2); d = ImageDraw.Draw(im)
    d.ellipse([0, 0, r * 2 - 1, r * 2 - 1], fill=(255, 255, 255, 60), outline=col + (255,), width=max(2, r // 14))
    d.polygon([(r * 0.78, r * 0.55), (r * 0.78, r * 1.45), (r * 1.5, r)], fill=col + (255,))
    return im

def phone(w=300, kind="product", seed=1):
    h = int(w * 2.0); im = rgba(w, h); d = ImageDraw.Draw(im)
    rrect(d, [0, 0, w, h], int(w * 0.14), fill=(20, 18, 28))
    sc = photo(w - 24, h - 24, kind, seed)
    m = Image.new("L", sc.size, 0); rrect(ImageDraw.Draw(m), [0, 0, sc.width, sc.height], int(w * 0.11), fill=255)
    im.paste(sc, (12, 12), m)
    d = ImageDraw.Draw(im)
    rrect(d, [w * 0.38, 22, w * 0.62, 36], 7, fill=(10, 8, 14))
    for i, y in enumerate([0.62, 0.70, 0.78]):
        d.ellipse([w * 0.82, h * y, w * 0.92, h * y + w * 0.1], fill=(255, 255, 255, 220))
    rrect(d, [w * 0.08, h * 0.88, w * 0.62, h * 0.9], 4, fill=(255, 255, 255, 230))
    rrect(d, [w * 0.08, h * 0.92, w * 0.45, h * 0.935], 4, fill=(255, 255, 255, 150))
    return im

def filmstrip(n=5, fw=220, kinds=None, seed=0, vertical=False):
    fh = int(fw * 0.7); pad = 34; w = n * (fw + 14) + 14; h = fh + pad * 2
    im = rgba(w, h, (18, 15, 24, 255)); d = ImageDraw.Draw(im)
    for x in range(8, w - 10, 26):
        rrect(d, [x, 9, x + 14, 23], 3, fill=(235, 228, 245, 255)); rrect(d, [x, h - 23, x + 14, h - 9], 3, fill=(235, 228, 245, 255))
    kinds = kinds or ["landscape", "portrait", "city", "abstract", "product"]
    for i in range(n):
        im.alpha_composite(photo(fw, fh, kinds[i % len(kinds)], seed + i), (14 + i * (fw + 14), pad))
    im = grain(im, 0.04, seed)
    return im.rotate(90, expand=True) if vertical else im

def bottle(w=220, h=380):
    s = 3; W2, H2 = w * s, h * s; im = rgba(W2, H2); d = ImageDraw.Draw(im)
    rrect(d, [W2 * 0.3, 0, W2 * 0.7, H2 * 0.2], 10 * s, fill=(20, 16, 26))
    rrect(d, [W2 * 0.36, H2 * 0.16, W2 * 0.64, H2 * 0.27], 4 * s, fill=(210, 190, 140))
    body = grad(int(W2), int(H2 * 0.75), (210, 180, 255), (110, 40, 220), 20)
    m = Image.new("L", body.size, 0); rrect(ImageDraw.Draw(m), [0, 0, body.width, body.height], 40 * s, fill=255)
    im.paste(body, (0, int(H2 * 0.25)), m); d = ImageDraw.Draw(im)
    rrect(d, [W2 * 0.08, H2 * 0.3, W2 * 0.2, H2 * 0.9], 20 * s, fill=(255, 255, 255, 90))
    rrect(d, [W2 * 0.25, H2 * 0.52, W2 * 0.75, H2 * 0.74], 6 * s, fill=(250, 246, 240))
    d.line([W2 * 0.33, H2 * 0.6, W2 * 0.67, H2 * 0.6], fill=(60, 30, 110), width=4 * s)
    d.line([W2 * 0.38, H2 * 0.66, W2 * 0.62, H2 * 0.66], fill=(160, 120, 210), width=3 * s)
    return im.resize((w, h), Image.LANCZOS)

def clapper(w=360):
    h = int(w * 0.85); im = rgba(w, h); d = ImageDraw.Draw(im)
    rrect(d, [0, h * 0.25, w, h], 14, fill=(22, 18, 30))
    d.rectangle([0, h * 0.25, w, h * 0.38], fill=(240, 236, 246))
    for i in range(6): d.polygon([(i * w / 6 + 10, h * 0.25), (i * w / 6 + 40, h * 0.25), (i * w / 6 + 20, h * 0.38), (i * w / 6 - 10, h * 0.38)], fill=(22, 18, 30))
    for y in (0.52, 0.66, 0.8): d.line([w * 0.08, h * y, w * 0.92, h * y], fill=(120, 110, 140), width=3)
    top = rgba(w, int(h * 0.16)); td = ImageDraw.Draw(top); td.rectangle([0, 0, w, top.height], fill=(240, 236, 246))
    for i in range(6): td.polygon([(i * w / 6 + 10, 0), (i * w / 6 + 40, 0), (i * w / 6 + 20, top.height), (i * w / 6 - 10, top.height)], fill=VIOLET)
    im.alpha_composite(top.rotate(12, expand=False, center=(0, top.height)), (0, int(h * 0.06)))
    return im

def pencil(w=420):
    h = 46; im = rgba(w, h); d = ImageDraw.Draw(im)
    d.rectangle([40, 4, w - 60, h - 4], fill=(150, 70, 240)); d.rectangle([40, 4, w - 60, 16], fill=(190, 120, 255))
    d.rectangle([w - 60, 4, w - 20, h - 4], fill=(200, 200, 210)); rrect(d, [w - 26, 4, w, h - 4], 8, fill=(240, 150, 190))
    d.polygon([(40, 4), (40, h - 4), (0, h / 2)], fill=(232, 200, 160)); d.polygon([(12, h / 2 - 7), (12, h / 2 + 7), (0, h / 2)], fill=(20, 16, 26))
    return im

def scribble(w, h, seed=0, col=LAV, width=5, kind="loop"):
    s = 2; im = rgba(w * s, h * s); d = ImageDraw.Draw(im); rnd = random.Random(seed)
    if kind == "loop":
        pts = [(w * s * (0.1 + 0.8 * i / 60) + math.cos(i * 0.5) * w * s * 0.08, h * s * 0.5 + math.sin(i * 0.5) * h * s * 0.3 + rnd.uniform(-3, 3)) for i in range(61)]
    elif kind == "arrow":
        pts = [(w * s * (0.05 + 0.85 * t), h * s * (0.75 - 0.5 * math.sin(t * 2.6))) for t in np.linspace(0, 1, 40)]
    elif kind == "star":
        pts = []
        for i in range(11):
            a = -math.pi / 2 + i * math.pi / 5; r = (0.48 if i % 2 == 0 else 0.2) * min(w, h) * s
            pts.append((w * s / 2 + math.cos(a) * r, h * s / 2 + math.sin(a) * r))
    else:  # underline
        pts = [(w * s * t, h * s * 0.5 + math.sin(t * 9) * h * s * 0.15) for t in np.linspace(0.02, 0.98, 50)]
    d.line(pts, fill=col + (255,), width=width * s, joint="curve")
    if kind == "arrow":
        x, y = pts[-1]; d.line([(x - 26 * s, y - 4 * s), (x, y), (x - 10 * s, y + 22 * s)], fill=col + (255,), width=width * s, joint="curve")
    return im.resize((w, h), Image.LANCZOS)

def sparkle(r=40, col=WHITE):
    im = rgba(r * 2, r * 2); d = ImageDraw.Draw(im)
    d.polygon([(r, 0), (r * 1.14, r * 0.86), (r * 2, r), (r * 1.14, r * 1.14), (r, r * 2), (r * 0.86, r * 1.14), (0, r), (r * 0.86, r * 0.86)], fill=col + (255,))
    return im

def circle(r, col, alpha=255, ring=0):
    im = rgba(r * 2, r * 2); d = ImageDraw.Draw(im)
    if ring: d.ellipse([ring / 2, ring / 2, r * 2 - ring / 2, r * 2 - ring / 2], outline=col + (alpha,), width=ring)
    else: d.ellipse([0, 0, r * 2 - 1, r * 2 - 1], fill=col + (alpha,))
    return im

def glow(r, col, alpha=160):
    im = rgba(r * 2, r * 2); ImageDraw.Draw(im).ellipse([r * 0.5, r * 0.5, r * 1.5, r * 1.5], fill=col + (alpha,))
    return im.filter(ImageFilter.GaussianBlur(r * 0.28))

def grid_paper(w, h, seed=0):
    p = paper(w, h, (240, 236, 228), seed, amp=6)
    d = ImageDraw.Draw(p)
    for x in range(20, w, 22): d.line([x, 12, x, h - 12], fill=(150, 130, 210, 90))
    for y in range(20, h, 22): d.line([12, y, w - 12, y], fill=(150, 130, 210, 90))
    p.putalpha(p.getchannel("A")); return p

def label(text, size=34, fg=INK, bg=CREAM, seed=0, path=F_BOLD, padx=26, pady=16):
    f = font(path, size); bb = f.getbbox(text)
    w = bb[2] - bb[0] + padx * 2; h = size + pady * 2
    p = paper(w, h, bg, seed, amp=4, rim=False, texture=0.04)
    ImageDraw.Draw(p).text((w / 2, h / 2), text, font=f, fill=fg, anchor="mm")
    return p

def mag_scrap(text, size=60, seed=0, fg=INK, bg=CREAM, path=F_BLACK):
    return label(text, size, fg, bg, seed, path, padx=22, pady=10)

def keyframe_ui(w=520, h=220):
    im = rgba(w, h, (22, 19, 30, 240)); d = ImageDraw.Draw(im)
    for i, (y, col) in enumerate([(40, MAGENTA), (95, LAV), (150, VIOLET)]):
        rrect(d, [20, y - 14, w - 20, y + 14], 8, fill=(40, 36, 52))
        for x in (60 + i * 40, 220 + i * 25, 380 - i * 20):
            d.polygon([(x, y - 11), (x + 11, y), (x, y + 11), (x - 11, y)], fill=col)
    d.line([300, 10, 300, h - 10], fill=(255, 255, 255), width=3)
    return im

def node_net(w, h, n=26, seed=0):
    rnd = random.Random(seed)
    pts = [(rnd.uniform(0.06, 0.94) * w, rnd.uniform(0.06, 0.94) * h) for _ in range(n)]
    edges = []
    for i, p in enumerate(pts):
        ds = sorted(range(n), key=lambda j: math.dist(p, pts[j]))[1:4]
        for j in ds:
            if (j, i) not in edges: edges.append((i, j))
    return pts, edges

def logo_cutout(path):
    im = Image.open(path).convert("RGB").crop((560, 350, 1440, 1150))
    a = np.asarray(im).astype(np.float32); bg = np.array([3, 0, 21], np.float32)
    d = np.abs(a - bg).max(-1); al = np.clip((d - 10) / 45, 0, 1)
    rgb = (a - bg * (1 - al[..., None])) / np.maximum(al[..., None], 1e-3)
    out = np.dstack([np.clip(rgb, 0, 255), al * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA"); return img.crop(img.getbbox())

def icon(kind, s=150, col=INK):
    im = rgba(s, s); d = ImageDraw.Draw(im); lw = max(4, s // 22)
    if kind == "building":
        d.rectangle([s * .22, s * .18, s * .62, s * .9], outline=col, width=lw); d.rectangle([s * .62, s * .45, s * .82, s * .9], outline=col, width=lw)
        for y in (.3, .46, .62): d.rectangle([s * .32, s * y, s * .52, s * y + s * .07], fill=col)
    elif kind == "brand":
        pts = [(s * .5 + math.cos(-math.pi / 2 + i * math.pi / 5) * s * (.4 if i % 2 == 0 else .17), s * .52 + math.sin(-math.pi / 2 + i * math.pi / 5) * s * (.4 if i % 2 == 0 else .17)) for i in range(10)]
        d.polygon(pts, outline=col, width=lw); d.line(pts + [pts[0]], fill=col, width=lw)
    elif kind == "box":
        d.polygon([(s * .5, s * .15), (s * .85, s * .32), (s * .5, s * .5), (s * .15, s * .32)], outline=col, width=lw)
        d.line([(s * .15, s * .32), (s * .15, s * .72), (s * .5, s * .9), (s * .85, s * .72), (s * .85, s * .32)], fill=col, width=lw, joint="curve")
        d.line([(s * .5, s * .5), (s * .5, s * .9)], fill=col, width=lw)
    elif kind == "bulb":
        d.ellipse([s * .25, s * .1, s * .75, s * .6], outline=col, width=lw)
        d.rectangle([s * .38, s * .6, s * .62, s * .78], outline=col, width=lw); d.line([s * .4, s * .86, s * .6, s * .86], fill=col, width=lw)
        for a in (-150, -90, -30): d.line([s * .5 + math.cos(math.radians(a)) * s * .33, s * .35 + math.sin(math.radians(a)) * s * .33, s * .5 + math.cos(math.radians(a)) * s * .45, s * .35 + math.sin(math.radians(a)) * s * .45], fill=col, width=lw)
    return im
