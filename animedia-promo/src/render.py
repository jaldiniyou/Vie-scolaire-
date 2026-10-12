import sys, json, math, random, subprocess, multiprocessing as mp
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from assets import *

FPS = 30
TL = json.load(open("timeline.json")); DUR = TL["dur"]
LOGO = "/tmp/claude-0/-home-user-Vie-scolaire-/c7b9b2db-6537-50ca-af16-197d20915c48/images/1.jpg"

def cl(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def prog(t, a, d): return cl((t - a) / d)
def eo(p): return 1 - (1 - p) ** 3
def eexp(p): return 1 if p >= 1 else 1 - 2 ** (-10 * p)
def eio(p): return 4 * p ** 3 if p < .5 else 1 - (-2 * p + 2) ** 3 / 2
def back(p, c=1.6):
    p = p - 1; return 1 + (c + 1) * p ** 3 + c * p ** 2 if p > -1 else 0
def lerp(a, b, p): return a + (b - a) * p

# ------------------------------------------------------------------ engine
class Fr:
    def __init__(self, canvas, t): self.c = canvas; self.t = t; self.zoom = 1.0; self.cx = 0.0; self.cy = 0.0

def blit(c, im, x, y):
    x, y = int(round(x)), int(round(y))
    x0, y0 = max(0, x), max(0, y); x1, y1 = min(W, x + im.width), min(H, y + im.height)
    if x1 <= x0 or y1 <= y0: return
    if (x0, y0, x1, y1) != (x, y, x + im.width, y + im.height):
        im = im.crop((x0 - x, y0 - y, x1 - x, y1 - y))
    c.alpha_composite(im, (x0, y0))

def fade(im, a):
    if a >= 0.999: return im
    im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * a))); return im

def xf(im, s, sx, sy, r):
    w, h = max(1, int(im.width * s * sx)), max(1, int(im.height * s * sy))
    if (w, h) != im.size: im = im.resize((w, h), Image.BILINEAR)
    if abs(r) > 0.05: im = im.rotate(r, Image.BICUBIC, expand=True)
    return im

def put(fr, spr, x, y, s=1.0, r=0.0, a=1.0, z=1.0, sx=1.0, sy=1.0, shadow=True, sh_off=(14, 22)):
    if a <= 0.01 or s <= 0.005: return
    zm = 1 + (fr.zoom - 1) * z
    X = W / 2 + (x - W / 2 - fr.cx * z) * zm; Y = H / 2 + (y - H / 2 - fr.cy * z) * zm
    sc = s * zm
    img = spr.img if isinstance(spr, Sprite) else spr
    if img.width * sc * sx < 1 or img.height * sc * sy < 1: return
    if shadow and isinstance(spr, Sprite) and spr.sh is not None:
        sh = fade(xf(spr.sh, sc, sx, sy, r), a)
        blit(fr.c, sh, X - sh.width / 2 + sh_off[0] * sc * z, Y - sh.height / 2 + sh_off[1] * sc * z)
    t = fade(xf(img, sc, sx, sy, r), a)
    blit(fr.c, t, X - t.width / 2, Y - t.height / 2)

# ------------------------------------------------------------------ kinetic type
_gc = {}
def glyph(ch, path, size, col):
    k = (ch, path, size, col)
    if k not in _gc:
        f = font(path, size); asc, desc = f.getmetrics()
        w = max(1, int(f.getlength(ch))) + 60
        im = rgba(w, asc + desc + 60); ImageDraw.Draw(im).text((30, 30), ch, font=f, fill=col + (255,))
        sh = shadow_of(im, max(3, size // 18), 0.6)
        out = rgba(w, im.height); out.alpha_composite(sh, (max(2, size // 30), max(3, size // 20))); out.alpha_composite(im)
        _gc[k] = out
    return _gc[k]

_strip = {}
def hl_strip(w, h, col, seed):
    k = (w, h, col, seed)
    if k not in _strip: _strip[k] = Sprite(paper(w, h, col, seed, amp=5, rim=False, texture=0.06), blur=8, op=0.45)
    return _strip[k]

def ktext(fr, text, path, size, x, y, t0, col=WHITE, stagger=0.028, dur=0.55, track=0, hl=(), hl_col=VIOLET,
          t_out=None, rise=0.55, style="rise", colors=None):
    t = fr.t
    if t < t0 - 0.01: return
    if t_out is not None and t > t_out + 0.4: return
    f = font(path, size); asc, desc = f.getmetrics()
    xs = []; cur = 0
    for i, ch in enumerate(text):
        xs.append(cur); cur += f.getlength(ch) + track
    total = cur - track; left = x - total / 2
    aout = 1.0; yout = 0
    if t_out is not None:
        po = eio(prog(t, t_out, 0.35)); aout = 1 - po; yout = -po * size * 0.4
    # highlight strips behind words
    words = text.split(" "); pos = 0
    for wi, wd in enumerate(words):
        if wd in hl or wi in hl:
            i0 = pos; i1 = pos + len(wd)
            wx0 = left + xs[i0] - size * 0.14; wx1 = left + (xs[i1 - 1] + f.getlength(text[i1 - 1])) + size * 0.14
            p = eo(prog(t, t0 + stagger * i0, 0.4))
            if p > 0:
                sp = hl_strip(int(wx1 - wx0), int(size * 1.12), hl_col, i0 + size)
                cw = max(1, int(sp.img.width * p))
                im = sp.img.crop((0, 0, cw, sp.img.height))
                blit(fr.c, fade(sp.sh.crop((0, 0, cw, sp.img.height)), aout), wx0 + 6, y - size * 0.56 + yout + 9)
                blit(fr.c, fade(im, aout), wx0, y - size * 0.56 + yout)
        pos += len(wd) + 1
    for i, ch in enumerate(text):
        if ch == " ": continue
        p = prog(t, t0 + i * stagger, dur)
        if p <= 0: continue
        c = colors[i] if colors else col
        g = glyph(ch, path, size, c)
        if style == "rise":
            dy = (1 - eo(p)) * size * rise; a = cl(p * 2.2); s = 1; r = (1 - eo(p)) * -8
        else:  # pop
            s = back(p, 2.2); dy = 0; a = cl(p * 3); r = (1 - p) * 20
        gi = fade(g, a * aout)
        if s != 1 or abs(r) > 0.1: gi = xf(gi, max(0.01, s), 1, 1, r)
        gx = left + xs[i] - 30 + g.width / 2
        blit(fr.c, gi, gx - gi.width / 2, y + dy + yout - gi.height / 2)

# ------------------------------------------------------------------ static layers
def make_bg():
    a = np.zeros((H, W, 3), np.float32); a[:] = BG
    y, x = np.mgrid[0:H, 0:W]
    g = np.exp(-(((x - W * 0.5) / (W * 0.7)) ** 2 + ((y - H * 0.45) / (H * 0.5)) ** 2))
    a += g[..., None] * np.array([22, 10, 40], np.float32)
    im = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
    return grain(im, 0.10, 5)
BGIMG = make_bg()
def vignette():
    y, x = np.mgrid[0:H, 0:W]
    v = np.clip((((x - W / 2) / (W * 0.62)) ** 2 + ((y - H / 2) / (H * 0.62)) ** 2) - 0.35, 0, 1) ** 1.3
    im = rgba(W, H, (4, 2, 8, 255)); im.putalpha(Image.fromarray((v * 200).astype(np.uint8))); return im
VIG = vignette()
def grains():
    out = []; rng = np.random.default_rng(1)
    for k in range(6):
        n = rng.normal(0, 1, (H // 2, W // 2))
        v = (np.clip(n, -2, 2) + 2) / 4 * 255
        im = Image.fromarray(v.astype(np.uint8)).resize((W, H), Image.NEAREST).convert("RGBA")
        im.putalpha(18); out.append(im)
    return out
GRAINS = grains()

# ------------------------------------------------------------------ assets
print("building assets...", file=sys.stderr)
S = {}
S["frag"] = Sprite(paper(300, 300, VIOLET, 3, amp=6, fill=grad(300, 300, MAGENTA, (90, 30, 200), 45)))
S["sil"] = Sprite(silhouette(560, 700, 2), blur=18)
S["cam"] = Sprite(sticker(camera(380), 8, seed=1))
S["cam_s"] = Sprite(sticker(camera(250), 7, seed=11))
S["pol_land"] = Sprite(polaroid(340, 410, "landscape", 3, "idée n°1"), blur=12)
S["pol_port"] = Sprite(polaroid(330, 400, "portrait", 8), blur=12)
S["pol_city"] = Sprite(polaroid(300, 360, "city", 5), blur=12)
S["film4"] = Sprite(filmstrip(4, 170, seed=2), blur=12)
S["film8"] = Sprite(filmstrip(9, 300, seed=7), blur=16)
S["pencil"] = Sprite(sticker(pencil(380), 6))
S["star"] = Sprite(scribble(170, 170, 1, LAV, 6, "star"), shadow=False)
S["arrow"] = Sprite(scribble(300, 160, 2, WHITE, 6, "arrow"), shadow=False)
S["loop"] = Sprite(scribble(520, 220, 3, LAV, 6, "loop"), shadow=False)
S["under"] = Sprite(scribble(520, 60, 4, MAGENTA, 8, "under"), shadow=False)
S["spark"] = Sprite(sparkle(36), shadow=False); S["spark_l"] = Sprite(sparkle(26, LAV), shadow=False)
S["torn_abs"] = Sprite(torn_photo(260, 200, "abstract", 9))
S["torn_abs2"] = Sprite(torn_photo(220, 280, "abstract", 21))
S["grid"] = Sprite(grid_paper(330, 250, 4))
S["circ_lav"] = Sprite(paper(240, 240, LAV, 5, amp=5, rim=False), blur=10)
S["circ_v"] = Sprite(circle(120, VIOLET), shadow=False)
S["scrap_idee"] = Sprite(mag_scrap("IDÉE", 54, 1, WHITE, INK))
S["scrap_n"] = Sprite(mag_scrap("N°01", 40, 2, INK, LAV))
m = Image.new("L", (240, 240), 0); ImageDraw.Draw(m).ellipse([0, 0, 239, 239], fill=255)
c = paper(240, 240, LAV, 5, amp=5, rim=False); c.putalpha(ImageChops.multiply(c.getchannel("A"), m.filter(ImageFilter.GaussianBlur(1)))); S["circ_lav"] = Sprite(c, blur=10)
S["sheet_dark"] = Sprite(paper(920, 1000, (30, 24, 44), 11, amp=9), blur=24)
S["monitor"] = Sprite(sticker(monitor(600, photo(564, 408, "landscape", 12)), 8, seed=3))
S["play"] = Sprite(play_icon(54), shadow=False)
S["film_tilt"] = S["film4"]
S["backdrop_v"] = Sprite(paper(1000, 1260, VIOLET, 21, amp=9, fill=grad(1000, 1260, (150, 70, 250), (60, 18, 130), 80)), blur=26)
spot = rgba(700, 1000); ImageDraw.Draw(spot).polygon([(290, 0), (410, 0), (700, 1000), (0, 1000)], fill=(255, 255, 255, 60))
S["spot"] = Sprite(spot.filter(ImageFilter.GaussianBlur(30)), shadow=False)
pod = rgba(520, 220); d = ImageDraw.Draw(pod)
d.rectangle([0, 60, 520, 170], fill=(220, 210, 235)); d.ellipse([0, 110, 520, 220], fill=(200, 188, 220)); d.ellipse([0, 0, 520, 120], fill=(246, 242, 252))
S["podium"] = Sprite(grain(pod, 0.05, 2), blur=20)
S["bottle"] = Sprite(sticker(bottle(240, 420), 8, seed=4))
S["phone"] = Sprite(sticker(phone(230, "product", 3), 7, seed=5))
S["ring"] = circle(150, LAV, 255, ring=6)
S["board"] = Sprite(paper(1000, 1200, (26, 22, 38), 31, amp=8), blur=24)
board_grid = rgba(1000, 1200); d = ImageDraw.Draw(board_grid)
for xg in range(40, 1000, 60): d.line([xg, 30, xg, 1170], fill=(150, 120, 230, 40))
for yg in range(40, 1200, 60): d.line([30, yg, 970, yg], fill=(150, 120, 230, 40))
S["board_grid"] = board_grid
S["sq"] = Sprite(paper(190, 190, LAV, 41, amp=4, rim=False), blur=12)
tri = rgba(220, 200); ImageDraw.Draw(tri).polygon([(110, 0), (220, 200), (0, 200)], fill=MAGENTA + (255,)); S["tri"] = Sprite(grain(tri, 0.06, 3), blur=12)
S["ball"] = Sprite(circle(90, VIOLET), blur=12)
S["kf"] = Sprite(sticker(keyframe_ui(520, 200), 6, seed=6))
S["cream"] = Sprite(paper(980, 1060, CREAM, 51, amp=10, halftone=((215, 200, 240, 255), 18)), blur=26)
hc = paper(620, 620, VIOLET, 52, amp=6, rim=False, halftone=((90, 30, 190, 255), 16))
m = Image.new("L", (620, 620), 0); ImageDraw.Draw(m).ellipse([10, 10, 610, 610], fill=255)
hc.putalpha(ImageChops.multiply(hc.getchannel("A"), m)); S["half_circ"] = Sprite(hc, blur=20)
S["portrait"] = Sprite(torn_photo(520, 660, "portrait", 8, amp=11), blur=20)
S["land"] = Sprite(torn_photo(430, 300, "landscape", 13), blur=14)
S["mag_strip"] = Sprite(paper(420, 80, MAGENTA, 61, amp=5), blur=10)
S["l_img"] = Sprite(label("IMAGES RÉELLES", 32, seed=1)); S["l_ill"] = Sprite(label("ILLUSTRATIONS", 32, WHITE, INK, seed=2))
S["l_tex"] = Sprite(label("TEXTURES", 32, INK, LAV, seed=3)); S["l_fx"] = Sprite(label("EFFETS VISUELS", 32, WHITE, VIOLET, seed=4))
pl = rgba(300, 300); d = ImageDraw.Draw(pl)
pl.alpha_composite(grad(300, 300, (255, 190, 240), (110, 40, 230), 45).resize((300, 300)), (0, 0))
pm = Image.new("L", (300, 300), 0); ImageDraw.Draw(pm).ellipse([40, 40, 260, 260], fill=255)
planet = rgba(300, 300); planet.paste(pl, (0, 0), pm)
ring = rgba(300, 300); ImageDraw.Draw(ring).ellipse([0, 120, 300, 180], outline=(240, 230, 255, 255), width=7)
planet.alpha_composite(ring); S["planet"] = Sprite(sticker(grain(planet, 0.05, 1), 7), blur=16)
S["glow_v"] = glow(420, PURPLE, 150); S["glow_m"] = glow(300, MAGENTA, 120)
S["ai_city"] = Sprite(torn_photo(330, 240, "city", 31)); S["ai_abs"] = Sprite(torn_photo(300, 300, "abstract", 32))
S["ai_land"] = Sprite(torn_photo(340, 230, "landscape", 33))
S["sil_s"] = Sprite(silhouette(440, 550, 7), blur=16)
NET = node_net(600, 740, 28, 3)
cards = [("ENTREPRISE", "building", CREAM, INK), ("MARQUE", "brand", VIOLET, WHITE), ("PRODUITS", "box", LAV, INK), ("PROJETS\nPERSONNELS", "bulb", MAGENTA, WHITE)]
for i, (txt, ic, bgc, fg) in enumerate(cards):
    p = paper(420, 420, bgc, 70 + i, amp=7)
    p.alpha_composite(icon(ic, 150, fg + (255,)), (135, 70)); d = ImageDraw.Draw(p)
    d.multiline_text((210, 315), txt, font=font(F_BLACK, 40 if "\n" not in txt else 36), fill=fg, anchor="mm", align="center", spacing=6)
    S[f"card{i}"] = Sprite(p, blur=18)
S["clapper"] = Sprite(sticker(clapper(330), 8, seed=8))
S["logo"] = Sprite(logo_cutout(LOGO), blur=26, op=0.6)
S["pill"] = Sprite(label("CONTACTEZ-NOUS", 34, WHITE, VIOLET, seed=9, padx=40, pady=20))
frags = []
for i in range(10):
    col = [VIOLET, LAV, MAGENTA, PURPLE, (60, 20, 120)][i % 5]
    frags.append(Sprite(paper(random.Random(i).randint(140, 260), random.Random(i + 9).randint(100, 200), col, 80 + i, amp=6), blur=12))
S["frags"] = frags
# transition sheets
def sheet(vertical, col, seed):
    if vertical:
        p = paper(1700, 3000, col, seed, amp=14, sides="tb", fill=grad(1700, 3000, col, tuple(int(v * 0.55) for v in col), 90))
    else:
        p = paper(3000, 2400, col, seed, amp=14, sides="lr", fill=grad(3000, 2400, col, tuple(int(v * 0.55) for v in col), 0))
    return p
SHEETS = {"v": (sheet(True, VIOLET, 91), sheet(True, LAV, 92)), "h": (sheet(False, PURPLE, 93), sheet(False, LAV, 94))}
print("assets ready", file=sys.stderr)

# ------------------------------------------------------------------ scenes
def scA(fr):
    t = fr.t
    fr.zoom = 1 + 0.12 * eio(prog(t, 0, 2.2))
    gp = prog(t, 0.0, 1.2)
    put(fr, S["glow_v"], 560, 980, s=0.6 + 0.8 * eo(gp), a=0.7 * gp, z=0.3, shadow=False)
    # silhouette enters
    ps = eo(prog(t, 0.25, 0.9))
    put(fr, S["sil"], lerp(-420, 250, ps), 1420, s=1.0, r=lerp(8, 0, ps), z=1.15, a=cl(ps * 2))
    # unfolding fragment
    pu = prog(t, 0.2, 0.75); ex = prog(t, 1.2, 0.9)
    if pu > 0:
        put(fr, S["frag"], 560, 980, s=lerp(0.45, 1.0, eo(pu)) * (1 + 0.6 * eo(ex)), sx=max(0.06, back(pu, 1.4)),
            r=lerp(45, -6, eo(pu)) + 10 * eo(ex), a=cl(pu * 4) * (1 - 0.35 * ex), z=0.8)
    # collage explosion
    items = [("cam", 820, 700, 12, 0.85, 1.25), ("pol_land", 220, 760, -12, 0.85, 1.1), ("film4", 780, 1330, -18, 0.95, 1.2),
             ("pencil", 830, 1120, 32, 0.8, 1.3), ("star", 300, 560, 0, 0.8, 0.9), ("torn_abs", 560, 610, 6, 0.85, 0.9),
             ("grid", 860, 960, 8, 0.75, 0.7), ("circ_lav", 330, 1060, 0, 0.6, 0.8), ("scrap_idee", 660, 1190, -6, 1.0, 1.35),
             ("scrap_n", 420, 640, 8, 1.0, 1.3), ("spark", 940, 560, 0, 0.9, 1.4), ("spark_l", 140, 1180, 0, 1.0, 1.4),
             ("spark", 520, 1380, 0, 0.6, 1.3), ("arrow", 760, 470, -8, 0.7, 1.2)]
    for i, (k, x, y, r, s, z) in enumerate(items):
        p = prog(t, 1.18 + i * 0.022, 0.85)
        if p <= 0: continue
        e = eexp(p)
        fl = math.sin(t * 1.3 + i) * 6
        put(fr, S[k], lerp(560, x, e), lerp(980, y, e) + fl, s=lerp(0.1, s, e), r=lerp(r + 120 * (1 if i % 2 else -1), r, e), z=z)
    ktext(fr, "ET SI VOS IDÉES", F_BLACK, 86, 540, 330, 0.3, stagger=0.03)
    ktext(fr, "PRENAIENT VIE ?", F_BLACK, 86, 540, 440, 0.95, hl=("VIE",), stagger=0.03)

def scB(fr):
    u = fr.t - 2.15
    fr.zoom = 1 + 0.07 * eio(prog(u, 0, 5)); fr.cx = lerp(-25, 25, eio(prog(u, 0, 5)))
    put(fr, S["glow_m"], 860, 520, s=1.2, a=0.5, z=0.2, shadow=False)
    p = eo(prog(u, 0, 0.6)); put(fr, S["sheet_dark"], 540, lerp(1500, 820, p), r=-2, z=0.5)
    def pop(k, x, y, r, t0, s=1.0, z=1.0, drift=0):
        q = prog(u, t0, 0.55)
        if q > 0: put(fr, S[k], x + math.sin(u * 0.8 + t0 * 7) * drift, y + math.cos(u * 0.7 + t0 * 5) * drift, s=s * back(q, 1.5), r=r + (1 - eo(q)) * 25, z=z, a=cl(q * 3))
    pop("circ_lav", 880, 470, 0, 0.2, 1.2, 0.5)
    pop("grid", 330, 400, 7, 0.25, 1.0, 0.6)
    pop("pol_land", 250, 560, -9, 0.35, 0.95, 0.85, 6)
    pop("film4", 330, 1130, -11, 0.5, 1.0, 0.9, 5)
    pop("monitor", 570, 800, 1.5, 0.4, 1.0, 1.0, 3)
    q = prog(u, 0.9, 0.5)
    if q > 0: put(fr, S["play"], 570 - fr.cx * 0.0, 760, s=back(q) * (1 + 0.05 * math.sin(u * 5)), z=1.0, shadow=False)
    pop("cam", 840, 1080, 9, 0.65, 0.95, 1.3, 7)
    pop("star", 160, 900, 0, 1.0, 0.7, 1.2)
    for i, (x, y) in enumerate([(900, 690), (180, 300), (700, 1260)]):
        q = prog(u, 1.1 + i * 0.2, 0.4)
        if q > 0: put(fr, S["spark"], x, y, s=0.6 * back(q) * (0.8 + 0.2 * math.sin(u * 6 + i)), r=u * 40, z=1.3)
    ktext(fr, "ANIMEDIA STUDIO", F_BLACK, 92, 540, 1440, 2.35, stagger=0.03, track=2)
    ktext(fr, "Créativité. Image. Mouvement.", F_SERIF_I, 62, 540, 1545, 3.9, col=LAV, stagger=0.018)

def scC(fr):
    t = fr.t; u = t - 7.15
    fr.zoom = 1 + 0.08 * eio(prog(u, 0, 2.8))
    put(fr, S["backdrop_v"], 540, 860, r=2, z=0.4)
    put(fr, S["spot"], 540, 760, a=0.8 + 0.2 * math.sin(u * 3), z=0.5, shadow=False)
    put(fr, S["glow_m"], 540, 900, s=1.4, a=0.45, z=0.6, shadow=False)
    put(fr, S["podium"], 540, 1190, z=1.0)
    # attention rings
    for k in range(4):
        q = ((t - 8.2) - k * 0.55)
        if q > 0:
            q = (q % 2.2) / 2.2 if t < 9.7 else min(q / 2.2, 1)
            put(fr, S["ring"], 540, 900, s=0.6 + 2.2 * eo(q), a=(1 - q) * 0.7, z=1.0, shadow=False)
    pb = prog(u, 0.1, 0.75)
    put(fr, S["bottle"], 540, lerp(500, 920, back(pb, 1.2)) + math.sin(u * 2.4) * 14, r=math.sin(u * 1.7) * 3, z=1.15, a=cl(pb * 3), sh_off=(0, 160))
    q = prog(u, 0.45, 0.6); put(fr, S["phone"], lerp(1250, 870, eo(q)), 1060, r=10, z=1.4)
    q = prog(u, 0.6, 0.6); put(fr, S["pol_city"], lerp(-200, 205, eo(q)), 1100, r=-10, z=1.35)
    for i, (x, y) in enumerate([(400, 760), (690, 830), (650, 650), (430, 1000)]):
        tw = 0.5 + 0.5 * math.sin(u * 5 + i * 2)
        put(fr, S["spark"], x, y, s=0.35 + 0.35 * tw * cl(u - 0.6), r=u * 60, z=1.2)
    ktext(fr, "VIDÉOS", F_BLACK, 116, 540, 340, 7.3)
    ktext(fr, "PUBLICITAIRES", F_BLACK, 92, 540, 460, 7.55, hl=(0,), stagger=0.025, hl_col=INK)
    ktext(fr, "qui captent l’attention", F_SERIF_I, 66, 540, 1440, 8.55, col=WHITE, stagger=0.02)

def scD(fr):
    t = fr.t; u = t - 9.92
    fr.zoom = 1 + 0.06 * eio(prog(u, 0, 3.8)); fr.cx = lerp(20, -20, eio(prog(u, 0, 3.8)))
    put(fr, S["board"], 540, 880, r=-1.5, z=0.4)
    put(fr, S["board_grid"], 540, 880, r=-1.5, z=0.4, shadow=False)
    # path drawing
    q = eio(prog(u, 0.3, 1.6))
    if q > 0:
        lp = S["loop"].img; cw = max(1, int(lp.width * q))
        put(fr, lp.crop((0, 0, cw, lp.height)), 540 - (lp.width - cw) / 2, 1040, z=0.8, shadow=False)
        put(fr, S["pencil"], 540 - lp.width / 2 + cw + 160, 1040 + math.sin(q * 30) * 60 - 20, r=-28, z=1.3, s=0.8)
    # orbiting circle
    a = u * 1.8
    put(fr, S["ball"], 540 + math.cos(a) * 260, 780 + math.sin(a * 2) * 120, s=0.9 + 0.2 * math.sin(a), z=1.1)
    # rotating square
    put(fr, S["sq"], 820, 640, r=u * 70, s=0.9 + 0.1 * math.sin(u * 3), z=0.9)
    # bouncing triangle w/ squash & stretch
    per = 0.8; ph = (u % per) / per; hgt = 4 * ph * (1 - ph)
    sq = cl(1 - hgt * 6)
    put(fr, S["tri"], 260, 980 - hgt * 330, sx=1 + 0.28 * sq, sy=1 - 0.24 * sq + 0.12 * hgt, r=(ph - 0.5) * 16, z=1.2)
    q = prog(u, 0.6, 0.6); put(fr, S["kf"], 560, lerp(1700, 1260, eo(q)), r=-2, z=1.25)
    ktext(fr, "MOTION", F_BLACK, 150, 540, 350, 10.0, style="pop", stagger=0.05)
    ktext(fr, "DESIGN", F_BLACK, 150, 540, 505, 10.4, col=LAV, style="pop", stagger=0.05)
    ktext(fr, "du mouvement à vos histoires", F_SERIF_I, 60, 540, 1440, 11.85, stagger=0.018)

def scE(fr):
    t = fr.t; u = t - 13.72
    fr.zoom = 1 + 0.16 * eio(prog(u, 0, 6.6)); fr.cx = lerp(-30, 30, eio(prog(u, 0, 6.6))); fr.cy = lerp(10, -20, eio(prog(u, 0, 6.6)))
    put(fr, S["cream"], 540, 790, r=-2, z=0.3)
    q = prog(u, 0.1, 0.7); put(fr, S["half_circ"], 600, 720, s=back(q, 1.2), r=u * 4, z=0.5)
    q = prog(u, 0.3, 0.6); put(fr, S["portrait"], 520, lerp(1300, 780, eo(q)), r=lerp(-10, -2, eo(q)), z=0.85, a=cl(q * 3))
    q = prog(t, 14.8, 0.5); put(fr, S["mag_strip"], 560, 1140, sx=max(0.01, eo(q)), r=-4, z=1.0) if q > 0 else None
    def pop(k, x, y, r, t0, s=1.0, z=1.0):
        q = prog(t, t0, 0.5)
        if q > 0: put(fr, S[k], x + math.sin(t + x) * 5, y + math.cos(t * 0.9 + y) * 5, s=s * back(q, 1.6), r=r + (1 - eo(q)) * 30, z=z, a=cl(q * 3))
    pop("land", 290, 1110, -7, 16.6, 1.0, 1.15); pop("l_img", 300, 940, -5, 16.75, 1.0, 1.4)
    pop("star", 830, 820, 0, 17.4, 0.9, 1.2); pop("arrow", 280, 470, -10, 17.5, 0.9, 1.1); pop("pencil", 820, 1010, 38, 17.6, 0.7, 1.3)
    pop("l_ill", 780, 690, 5, 17.55, 1.0, 1.4)
    pop("grid", 820, 450, 9, 18.3, 1.0, 0.9); pop("torn_abs2", 190, 680, -6, 18.4, 0.9, 1.0); pop("l_tex", 820, 300, -4, 18.4, 1.0, 1.35)
    # surreal: planet rising from the portrait
    q = prog(t, 18.95, 1.0)
    if q > 0:
        put(fr, S["glow_m"], 560, lerp(640, 470, eo(q)), s=1.2, a=0.7 * q, z=1.2, shadow=False)
        put(fr, S["planet"], 570, lerp(650, 470, eo(q)) + math.sin(t * 2) * 8, s=lerp(0.2, 1.0, back(q, 1.3)), r=u * 8, z=1.5)
        for i in range(6):
            a = i * 1.05 + t * 0.6; R = 140 + 120 * eo(q)
            put(fr, S["spark_l" if i % 2 else "spark"], 570 + math.cos(a) * R, 480 + math.sin(a) * R * 0.6, s=0.5 * eo(q), z=1.6)
    pop("l_fx", 330, 330, 4, 19.05, 1.0, 1.4)
    ktext(fr, "créations premium en", F_SERIF_I, 58, 540, 1405, 13.95, col=LAV, stagger=0.018)
    ktext(fr, "COLLAGE ANIMÉ", F_BLACK, 104, 540, 1510, 14.85, hl=("ANIMÉ",), stagger=0.035)

def scF(fr):
    t = fr.t; u = t - 20.37
    fr.zoom = 1 + 0.1 * eio(prog(u, 0, 6.9)); fr.cx = lerp(0, 25, eio(prog(u, 0, 6.9)))
    put(fr, S["glow_v"], 600, 900, s=1.5, a=0.55, z=0.3, shadow=False)
    q = prog(u, 0.1, 0.7); put(fr, S["sil_s"], lerp(-200, 240, eo(q)), 960, z=0.9, a=cl(q * 2))
    # neural net
    pts, edges = NET; ox, oy = 360, 520
    ov = rgba(W, H); d = ImageDraw.Draw(ov)
    zm = 1 + (fr.zoom - 1) * 1.0
    def P(p): return (W / 2 + (p[0] + ox - W / 2 - fr.cx) * zm, H / 2 + (p[1] + oy - H / 2) * zm)
    for k, (i, j) in enumerate(edges):
        q = prog(t, 20.6 + k * 0.035, 0.5)
        if q <= 0: continue
        a, b = P(pts[i]), P(pts[j])
        d.line([a, (lerp(a[0], b[0], q), lerp(a[1], b[1], q))], fill=(190, 150, 255, 150), width=3)
        if q >= 1:
            s = ((t * 0.7 + k * 0.13) % 1.0)
            x, y = lerp(a[0], b[0], s), lerp(a[1], b[1], s)
            d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(255, 255, 255, 230))
    for k, p in enumerate(pts):
        q = prog(t, 20.5 + k * 0.05, 0.3)
        if q <= 0: continue
        x, y = P(p); r = 9 * back(q) * (1 + 0.25 * math.sin(t * 4 + k))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(MAGENTA if k % 3 == 0 else LAV) + (255,))
    gl = ov.resize((W // 3, H // 3)).filter(ImageFilter.GaussianBlur(6)).resize((W, H))
    fr.c.alpha_composite(gl); fr.c.alpha_composite(gl); fr.c.alpha_composite(ov)
    # AI-generated images resolving from pixels
    for k, (key, x, y, r, t0) in enumerate([("ai_city", 790, 640, 6, 23.6), ("ai_abs", 250, 640, -7, 24.4), ("ai_land", 760, 1090, -4, 25.2)]):
        q = prog(t, t0, 0.9)
        if q <= 0: continue
        img = S[key].img; f = int(lerp(28, 1, eo(q)))
        if f > 1:
            pi = img.resize((max(1, img.width // f), max(1, img.height // f)), Image.BILINEAR).resize(img.size, Image.NEAREST)
            spr = Sprite(pi, blur=8)  # cheap shadow at small scale
        else: spr = S[key]
        put(fr, spr, x, y + math.sin(t * 1.4 + k) * 8, s=lerp(0.7, 1.0, eo(q)), r=r, a=cl(q * 3), z=1.3)
    ktext(fr, "CRÉATIVITÉ", F_BLACK, 116, 540, 320, 20.55, stagger=0.03)
    ktext(fr, "+ INTELLIGENCE ARTIFICIELLE", F_BLACK, 52, 540, 425, 21.55, col=LAV, stagger=0.02, track=1)
    ktext(fr, "Modernes.", F_SERIF_BI, 72, 540, 1360, 24.6, stagger=0.025)
    ktext(fr, "Originales.", F_SERIF_BI, 72, 540, 1450, 25.3, col=LAV, stagger=0.025)
    ktext(fr, "Sur mesure.", F_SERIF_BI, 72, 540, 1540, 26.05, stagger=0.025)

def scG(fr):
    t = fr.t; u = t - 27.25
    fr.zoom = 1 + 0.05 * eio(prog(u, 0, 4))
    put(fr, S["glow_v"], 540, 980, s=1.3, a=0.4, z=0.3, shadow=False)
    ktext(fr, "POUR VOTRE…", F_BLACK, 104, 540, 340, 27.4, stagger=0.035)
    q = eio(prog(t, 27.9, 0.5))
    if q > 0:
        un = S["under"].img; put(fr, un.crop((0, 0, max(1, int(un.width * q)), un.height)), 540 - un.width * (1 - q) / 2, 430, z=0, shadow=False)
    for i, ((x, y), t0, r) in enumerate(zip([(300, 790), (780, 790), (300, 1250), (780, 1250)], [27.75, 28.45, 29.37, 30.06], [-5, 4, 3, -4])):
        q = prog(t, t0, 0.6)
        if q <= 0: continue
        put(fr, S[f"card{i}"], x, lerp(y - 500, y, back(q, 1.3)) + math.sin(t * 1.5 + i) * 6, r=r + (1 - eo(q)) * (30 if i % 2 else -30), a=cl(q * 3), z=1.0 + i * 0.08)

def scH(fr):
    t = fr.t; u = t - 31.25
    punch = eo(prog(t, 33.78, 0.5))
    fr.zoom = 1 + 0.04 * eio(prog(u, 0, 2.5)) + 0.08 * punch
    put(fr, S["glow_m"], 540, 900, s=1.6, a=0.4, z=0.3, shadow=False)
    fx = 900 - (u * 160) % 1400 if False else lerp(1250, -300, u / 5.0)
    put(fr, S["film8"], fx, 880, r=-5, z=0.9)
    q = prog(u, 0.25, 0.6); put(fr, S["clapper"], 830, lerp(1700, 1170, back(q, 1.2)), r=lerp(30, 9, eo(q)), z=1.3)
    q = prog(u, 0.4, 0.6); put(fr, S["pol_port"], 240, lerp(1700, 1190, back(q, 1.2)), r=lerp(-30, -8, eo(q)), z=1.25)
    for k in range(3):  # ripples "marque les esprits"
        q = prog(t, 35.15 + k * 0.25, 1.1)
        if 0 < q < 1: put(fr, S["ring"], 540, 880, s=0.5 + 3 * eo(q), a=(1 - q) * 0.8, z=1.0, shadow=False)
    ktext(fr, "DES CONTENUS QUI", F_BLACK, 66, 540, 300, 31.36, stagger=0.02, t_out=33.55)
    ktext(fr, "RACONTENT", F_BLACK, 122, 540, 410, 32.1, stagger=0.03, t_out=33.55)
    ktext(fr, "VOTRE HISTOIRE", F_BLACK, 90, 540, 530, 32.75, hl=("HISTOIRE",), stagger=0.025, t_out=33.55)
    ktext(fr, "VALORISE", F_BLACK, 122, 540, 330, 33.82, stagger=0.03)
    ktext(fr, "VOTRE IMAGE", F_BLACK, 100, 540, 450, 34.3, hl=("IMAGE",), stagger=0.03)
    ktext(fr, "et marque", F_SERIF_I, 70, 540, 1400, 35.15, col=LAV, stagger=0.02)
    ktext(fr, "LES ESPRITS", F_BLACK, 100, 540, 1500, 35.5, hl=("ESPRITS",), hl_col=INK, stagger=0.03)
    fl = prog(t, 33.76, 0.4)
    if 0 < fl < 1: fr.c.alpha_composite(rgba(W, H, (255, 255, 255, int(220 * (1 - eo(fl))))))

def scI(fr):
    t = fr.t; u = t - 36.2
    fr.zoom = 1 + 0.04 * eio(prog(u, 0, 8.4))
    gp = eo(prog(u, 0, 1.0))
    put(fr, S["glow_v"], 540, 720, s=0.6 + 1.0 * gp, a=0.85 * gp * (0.9 + 0.1 * math.sin(t * 2)), z=0.2, shadow=False)
    # paper fragments converge then fold away behind logo
    for i, sp in enumerate(S["frags"]):
        a = i / len(S["frags"]) * math.tau + 0.4
        q = prog(u, 0.0 + i * 0.015, 0.55); fo = prog(u, 0.45, 0.35)
        if q <= 0 or fo >= 1: continue
        R = lerp(1100, 120, eexp(q))
        put(fr, sp, 540 + math.cos(a) * R, 720 + math.sin(a) * R * 1.2, s=lerp(1.2, 0.5, q) * (1 - fo), r=a * 57 + q * 90, z=1.1)
    q = prog(u, 0.32, 0.9)
    if q > 0:
        put(fr, S["logo"], 540, 720 + math.sin(t * 1.6) * 6, s=0.62 * lerp(0.3, 1.0, back(q, 1.4)), r=lerp(-25, 0, eo(q)), a=cl(q * 2.5), z=1.0)
    for i, (x, y) in enumerate([(250, 520), (840, 600), (300, 960), (820, 990), (540, 400)]):
        tw = 0.5 + 0.5 * math.sin(t * 3 + i * 1.7)
        put(fr, S["spark_l" if i % 2 else "spark"], x, y, s=0.45 * tw * eo(prog(u, 0.8 + i * 0.1, 0.4)), r=t * 50, z=1.2)
    ktext(fr, "ANIMEDIA STUDIO", F_BLACK, 86, 540, 1110, 36.3, stagger=0.03, track=4)
    TO = 41.0
    ktext(fr, "Votre vision,", F_SERIF_I, 64, 540, 1250, 37.98, stagger=0.02, t_out=TO)
    ktext(fr, "notre créativité,", F_SERIF_I, 64, 540, 1335, 38.74, col=LAV, stagger=0.02, t_out=TO)
    ktext(fr, "votre histoire en mouvement.", F_SERIF_I, 64, 540, 1420, 39.87, stagger=0.018, t_out=TO)
    q = prog(t, 41.2, 0.5)
    if q > 0: put(fr, S["pill"], 540, 1440 + (1 - eo(q)) * 40, s=back(q, 1.6), a=cl(q * 3), z=0)
    ktext(fr, "« Donnez vie à vos idées. »", F_SERIF_BI, 74, 540, 1290, 41.85, col=WHITE, stagger=0.022, hl=("vie",))

SCENES = [(0, scA), (2.15, scB), (7.15, scC), (9.92, scD), (13.72, scE), (20.37, scF), (27.25, scG), (31.25, scH), (36.2, scI)]
TRANS = [(2.15, "v", 1), (7.15, "h", 1), (9.92, "v", -1), (13.72, "h", -1), (20.37, "v", 1), (27.25, "h", 1), (31.25, "v", -1), (36.2, "v", 1)]
TD = 0.7

def draw_sheet(c, t):
    for B, kind, dirn in TRANS:
        p = (t - (B - TD / 2)) / TD
        if not (0 <= p <= 1): continue
        e = eio(p)
        main, sec = SHEETS[kind]
        for k, sp in enumerate((sec, main)):
            ee = eio(cl((p - (0.08 if k == 0 else 0.0)) / 0.92)) if k == 0 else e
            ee = eio(cl(p * 1.08 - (0.0 if k == 0 else 0.08)))
            if kind == "v":
                y = lerp(H + sp.height / 2, -sp.height / 2, ee) if dirn > 0 else lerp(-sp.height / 2, H + sp.height / 2, ee)
                blit(c, sp, W / 2 - sp.width / 2, y - sp.height / 2)
            else:
                x = lerp(W + sp.width / 2, -sp.width / 2, ee) if dirn > 0 else lerp(-sp.width / 2, W + sp.width / 2, ee)
                blit(c, sp, x - sp.width / 2, H / 2 - sp.height / 2)

def render(i):
    t = i / FPS
    c = BGIMG.copy(); fr = Fr(c, t)
    fn = [f for s, f in SCENES if s <= t][-1]
    fn(fr)
    draw_sheet(c, t)
    c.alpha_composite(VIG); c.alpha_composite(GRAINS[i % len(GRAINS)])
    if t > DUR - 0.35: c.alpha_composite(rgba(W, H, (0, 0, 0, int(255 * cl((t - (DUR - 0.35)) / 0.35)))))
    if t < 0.15: c.alpha_composite(rgba(W, H, (0, 0, 0, int(255 * (1 - t / 0.15)))))
    return c.convert("RGB").tobytes()

if __name__ == "__main__":
    N = int(DUR * FPS)
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        for tt in map(float, sys.argv[2:]):
            Image.frombytes("RGB", (W, H), render(int(tt * FPS))).save(f"still_{tt:05.2f}.jpg", quality=88)
        sys.exit()
    ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-i", "mix.wav", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
                           "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", "out.mp4"], stdin=subprocess.PIPE)
    with mp.get_context("fork").Pool(4) as pool:
        for k, b in enumerate(pool.imap(render, range(N), chunksize=4)):
            ff.stdin.write(b)
            if k % 150 == 0: print(f"frame {k}/{N}", file=sys.stderr, flush=True)
    ff.stdin.close(); ff.wait()
    print("done", file=sys.stderr)
