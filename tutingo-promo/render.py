#!/usr/bin/env python3
"""TutinGo — cut-out collage promo, 1080x1920 @ 30 fps, cut to the supplied voice-over.

Usage:
    python3 render.py preview 3.2 15 40      # write PNG stills for given times
    python3 render.py video                  # render silent video (4 processes)
"""
import functools
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image

from kit import *  # noqa: F401,F403

OUT = os.path.join(HERE, "out")
DUR = 68.16
NF = int(round(DUR * FPS))

# Scene starts sit on the natural pauses of the voice-over (detected from its
# energy envelope: 10.06-10.44, 19.60-20.02, 30.32-30.78, 42.40-43.30,
# 52.22-53.08, 59.26-59.86 s). Each transition spans TD seconds from the start.
ST = [0.0, 10.0, 19.45, 30.2, 42.45, 52.3, 59.2]
TD = 0.75


def pop(t, t0, d=0.5):
    return eob(prog(t, t0, d))


def fl(t, ph, ax=5.0, ay=7.0):
    return math.sin(t * 0.9 + ph) * ax, math.cos(t * 0.75 + ph * 1.3) * ay


# ---------------------------------------------------------------- assets


@functools.lru_cache(None)
def A():
    a = {}
    a["teacher"] = Spr(sticker(teacher(), 10, seed=1))
    a["boy"] = Spr(sticker(student_boy(), 9, seed=2))
    a["girl_img"] = student_girl()
    a["teacher_img"] = teacher()
    a["notebook"] = Spr(notebook(seed=3))
    a["notebook2"] = Spr(notebook(col=PURPLE, seed=4))
    a["books"] = Spr(book_stack(5))
    a["pi"] = Spr(math_sticker("π", PURPLE, 130, 6))
    a["sqrt"] = Spr(math_sticker("√x", TEAL, 100, 7))
    a["x2"] = Spr(math_sticker("x²", TERRA, 110, 8))
    a["sigma"] = Spr(math_sticker("Σ", SAFFRON, 110, 9))
    a["plus"] = Spr(math_sticker("+", PURPLE, 90, 10))
    a["div"] = Spr(math_sticker("÷", TEAL, 90, 11))
    a["lc1"] = Spr(lesson_card("Algèbre", TEAL, seed=12, formula="x² − 4 = 0"))
    a["lc2"] = Spr(lesson_card("Géométrie", TERRA, seed=13))
    a["lc3"] = Spr(lesson_card("Français", PURPLE, seed=14))
    a["blob_lav"] = Spr(torn_blob(330, LAV, seed=15, amp=12, fringe=9), shadow=0.2)
    a["blob_big"] = Spr(torn_blob(470, LAV, seed=16, amp=14, fringe=10), shadow=0.2)
    kr, _ = card(1500, 300, KRAFT, seed=17, amp=9, fringe=8)
    a["kraft"] = Spr(kr, shadow=0.25)
    # headlines
    a["h1"] = Spr(strip("Vous êtes professeur ?", 66, INK, PAPER, seed=20))
    a["h2a"] = Spr(strip("Comment toucher", 70, INK, PAPER, seed=21))
    a["h2b"] = Spr(strip("plus d’élèves ?", 70, PAPER, PURPLE, seed=22))
    a["h3a"] = Spr(strip("Enseignants et élèves,", 56, INK, PAPER, seed=23))
    a["h3b"] = Spr(strip("connectés.", 56, INK, SAFFRON, seed=24))
    a["h4a"] = Spr(strip("Mettez en valeur", 70, INK, PAPER, seed=25))
    a["h4b"] = Spr(strip("votre expertise", 70, PAPER, PURPLE, seed=26))
    a["h5a"] = Spr(strip("Plus de visibilité", 70, PAPER, PURPLE, seed=27))
    a["h5b"] = Spr(strip("Plus d’opportunités", 70, INK, PAPER, seed=28))
    a["h6a"] = Spr(strip("Partagez votre profil", 68, INK, PAPER, seed=29))
    a["h6b"] = Spr(strip("avec vos contacts et anciens élèves", 40, INK, SAFFRON, seed=30))
    a["h7a"] = Spr(strip("Créez et partagez", 70, INK, PAPER, seed=31))
    a["h7b"] = Spr(strip("votre profil", 70, PAPER, PURPLE, seed=32))
    a["slogan"] = Spr(strip("Learn Anywhere You Go", 58, PAPER, INK, seed=33))
    a["web"] = Spr(sticker(chip("www.tutingo.com", 54, PAPER, PURPLE, padx=40, pady=18), 7, seed=34))
    # logo card
    lc, pd = card(900, 330, PAPER, seed=35, amp=1.6)
    lg = logo_w(790)
    lc.alpha_composite(lg, (pd + 450 - lg.width // 2, pd + 165 - lg.height // 2))
    a["logocard_img"] = lc
    a["logocard"] = Spr(lc)
    # scene 2
    a["chalk"] = Spr(chalkboard())
    lap, box = laptop()
    a["laptop"], a["laptop_box"] = Spr(lap), box
    a["avatar_t"] = teacher_avatar(96, ring=PURPLE)
    a["mini"] = [mini_person(i, 84) for i in range(16)]
    a["dot_p"] = dot_sprite(4, PURPLE)
    a["dot_w"] = dot_sprite(4, PAPER)
    a["dot_i"] = dot_sprite(3, INK)
    a["dot_t"] = dot_sprite(3, TERRA)
    # scene 3 profile builder
    pc, _ = card(820, 1040, PAPER, seed=40, amp=1.4)
    a["pcard"] = Spr(pc)
    cov, _ = card(820, 180, PURPLE, seed=41, amp=1.2)
    a["cover"] = Spr(cov, shadow=0)
    a["avatar_big"] = Spr(teacher_avatar(230))
    nb = Pad(400, 80)
    nb.rect((10, 6, 390, 38), INK, r=16)
    nb.rect((70, 54, 330, 74), GREY, r=10)
    a["namebars"] = Spr(nb.done(), shadow=0)
    rows = []
    for i, (nm, lab) in enumerate((("book", "Matières"), ("cap", "Diplômes"), ("case", "Expérience"),
                                   ("bulb", "Méthode pédagogique"))):
        r_, p_ = card(720, 104, LILAC, seed=50 + i, amp=1.2)
        ic = icon(nm, 66, PAPER, PURPLE)
        r_.alpha_composite(ic, (p_ + 22, p_ + 19))
        from PIL import ImageDraw
        dr = ImageDraw.Draw(r_)
        dr.text((p_ + 112, p_ + 38), lab, font=font(BOLD, 34), fill=INK, anchor="lm")
        dr.rounded_rectangle((p_ + 112, p_ + 66, p_ + 112 + [420, 360, 300, 380][i], p_ + 80), radius=7,
                             fill=(196, 186, 226))
        rows.append(Spr(r_))
    a["rows"] = rows
    a["chips"] = [Spr(sticker(chip(s, 34, c2, c1), 7, seed=60 + i))
                  for i, (s, c1, c2) in enumerate((("Mathématiques", PURPLE, PAPER), ("Physique-Chimie", TEAL, PAPER),
                                                   ("Français", SAFFRON, INK), ("Anglais", TERRA, PAPER)))]
    a["check"] = Spr(sticker(icon("check", 120, PAPER, PURPLE), 8, seed=65))
    a["check_lab"] = Spr(strip("Profil complet", 34, INK, PAPER, padx=18, pady=10, seed=66))
    # scene 4
    pui, _ = profile_ui(480, 980, share=False)
    a["phone_s"] = Spr(phone(pui))
    mc, mp = card(170, 220, PAPER, seed=70, amp=1.0)
    av = teacher_avatar(110, ring=PURPLE)
    mc.alpha_composite(av, (mp + 85 - av.width // 2, mp + 14))
    q = Pad(mc.width, mc.height)
    q.rect((mp + 30, mp + 150, mp + 140, mp + 164), INK, r=7)
    q.rect((mp + 45, mp + 176, mp + 125, mp + 188), GREY, r=6)
    mc.alpha_composite(q.done())
    a["minicard"] = Spr(mc)
    a["hub"] = Spr(sticker(teacher_avatar(190, ring=PURPLE), 8, seed=71))
    a["people"] = [Spr(sticker(mini_person(i + 3, 118), 6, seed=80 + i)) for i in range(16)]
    a["eye"] = Spr(sticker(icon("eye", 120, INK, SAFFRON), 8, seed=72))
    a["bubble"] = Spr(sticker(icon("chat", 92, PAPER, PURPLE), 6, seed=73))
    a["bubble2"] = Spr(sticker(icon("chat", 80, INK, PAPER), 6, seed=74))
    rg = Pad(200, 200)
    rg.ell((6, 6, 194, 194), None, outline=PURPLE, width=8)
    a["ring"] = Spr(rg.done(), shadow=0)
    rw = Pad(200, 200)
    rw.ell((6, 6, 194, 194), None, outline=PAPER, width=8)
    a["ring_w"] = Spr(rw.done(), shadow=0)
    # scene 5
    p1, _ = card(980, 690, LAV, seed=90, amp=2.2, fringe=6)
    a["panel1"] = Spr(p1)
    p2, _ = card(980, 690, (255, 226, 200), seed=91, amp=2.2, fringe=6)
    a["panel2"] = Spr(p2)
    dk, _ = card(940, 170, KRAFT, seed=92, amp=4, fringe=5)
    a["desk"] = Spr(dk, shadow=0.3)
    tg1 = strip("En ligne", 46, PAPER, PURPLE, seed=93)
    a["tag_on"] = Spr(tg1)
    a["tag_in"] = Spr(strip("En présentiel", 46, INK, SAFFRON, seed=94))
    a["ic_video"] = Spr(sticker(icon("video", 84, PAPER, PURPLE), 6, seed=95))
    a["ic_house"] = Spr(sticker(icon("house", 84, INK, SAFFRON), 6, seed=96))
    ou = Pad(130, 130)
    ou.ell((0, 0, 130, 130), INK)
    ou.text((65, 62), "ou", BLACK, 52, PAPER)
    a["ou"] = Spr(sticker(ou.done(), 7, seed=97))
    a["teacher_crop"] = teacher().crop((40, 0, 560, 640))
    a["girl_tile"] = circle_crop(student_girl(), (95, 40, 375, 320), 84, ring=PAPER, bg=(214, 238, 230))
    a["teacher_s"] = Spr(sticker(teacher(), 8, seed=98))
    a["boy_s"] = Spr(sticker(student_boy(), 8, seed=99))
    # scene 6
    pui2, btn = profile_ui(480, 980, share=True)
    a["phone_big"] = Spr(phone(pui2))
    a["btn"] = btn
    a["targets"] = [Spr(sticker(icon(n, 128, fg, bg), 8, seed=100 + i))
                    for i, (n, fg, bg) in enumerate((("chat", PAPER, GREEN), ("mail", INK, SAFFRON),
                                                     ("share", PAPER, SKY), ("user", PAPER, TERRA)))]
    lk = Pad(250, 64)
    lk.rect((0, 0, 250, 64), PAPER, r=32)
    lk.rect((0, 0, 250, 64), None, r=32, outline=PURPLE, width=3)
    lki = lk.done()
    ic = icon("link", 44, PURPLE)
    lki.alpha_composite(ic, (14, 10))
    from PIL import ImageDraw
    ImageDraw.Draw(lki).text((66, 32), "Lien du profil", font=font(BOLD, 25), fill=PURPLE, anchor="lm")
    a["linkchip"] = Spr(lki)
    # scene 7
    a["phone_mini"] = Spr(phone(pui2))
    a["pin"] = Spr(sticker(icon("pin", 120, PIN, PAPER), 8, seed=110))
    lcimg = a["logocard_img"]
    hh = lcimg.height // 2
    top, bot = lcimg.crop((0, 0, lcimg.width, hh)), lcimg.crop((0, hh, lcimg.width, lcimg.height))
    back = Image.new("RGBA", top.size, (226, 220, 236, 255))
    back.putalpha(top.getchannel("A"))
    a["fold_top"], a["fold_bot"] = Spr(top), Spr(bot)
    a["fold_back"] = Spr(texturize(back.transpose(Image.FLIP_TOP_BOTTOM), 0.06, 111))
    return a


def solid(col, seed):
    im = Image.new("RGBA", (W, H), col + (255,))
    return texturize(im, 0.013, seed)


@functools.lru_cache(None)
def BG(k):
    if k == 0:
        return solid(CREAM, 1)
    if k == 1:
        return solid(PURPLE, 2)
    if k == 2:
        im = solid(CREAM, 3)
        grid = Image.new("RGBA", (1000, 1560), LILAC + (255,))
        from PIL import ImageDraw
        d = ImageDraw.Draw(grid)
        for x in range(0, 1000, 40):
            d.line((x, 0, x, 1560), fill=(214, 204, 246), width=2)
        for y in range(0, 1560, 40):
            d.line((0, y, 1000, y), fill=(214, 204, 246), width=2)
        sheet, _ = card(1000, 1560, LILAC, seed=4, amp=6, fringe=7, pattern=grid)
        put(im, Spr(sheet, shadow=0.18), 540, 1080, rot=-2)
        return im
    if k == 3:
        return solid(LILAC, 5)
    if k == 4:
        return solid(CREAM, 6)
    if k == 5:
        return solid(PURPLE, 7)
    return solid(CREAM, 8)


def headline(cv, sprs, ys, t, t0, xs=None, rots=None, t_out=None):
    for i, (s, y) in enumerate(zip(sprs, ys)):
        e = eo(prog(t, t0 + i * 0.14, 0.55))
        if e <= 0:
            continue
        x = (xs[i] if xs else 540)
        r = (rots[i] if rots else (-1.5 if i % 2 == 0 else 1.2))
        xx = lerp(-650, x, e)
        rr = lerp(-9, r, e)
        op = 1.0
        if t_out is not None and t > t_out:
            o = eio(prog(t, t_out + i * 0.06, 0.4))
            xx = lerp(x, 1700, o)
            rr = lerp(r, 8, o)
            op = 1 - o * 0.3
            if o >= 1:
                continue
        put(cv, s, xx, y, rot=rr, op=op, lift=1.2, j=30 + i)


# ---------------------------------------------------------------- scenes


def scene1(t):
    a = A()
    cv = BG(0).copy()
    dx, dy = fl(t, 0.3, 10, 12)
    put(cv, a["blob_lav"], 800 + dx, 700 + dy + (1 - eo(prog(t, 0, 0.9))) * -500, rot=t * 2, lift=0.6)
    put(cv, a["kraft"], 540 - dx, 1660 + (1 - eo(prog(t, 0.05, 0.8))) * 500, rot=-11, lift=0.7)
    objs = [  # sprite, x, y, rot, t0
        ("lc2", 245, 640, -7, 0.85), ("sigma", 560, 590, 4, 1.05), ("lc1", 840, 660, 6, 1.25),
        ("notebook", 170, 930, -11, 1.45), ("books", 905, 930, 5, 1.65),
        ("pi", 140, 1200, -8, 1.85), ("sqrt", 935, 1200, 7, 2.05), ("x2", 120, 1450, -5, 2.25),
        ("plus", 950, 1440, 9, 2.45),
    ]
    spread = eio(prog(t, 4.3, 1.2)) * 0.06
    e_t = eo(prog(t, 0.1, 0.9))
    for i, (k, x, y, r, t0) in enumerate(objs):
        s = pop(t, t0, 0.55)
        if s <= 0:
            continue
        ox, oy = fl(t, i * 1.7, 7, 9)
        x2 = 540 + (x - 540) * (1 + spread)
        y2 = 1000 + (y - 1000) * (1 + spread)
        put(cv, a[k], x2 + ox, y2 + oy, sc=s * (0.82 if k in ("books", "notebook") else 0.9),
            rot=r + math.sin(t + i) * 2, lift=1.3, j=i)
    put(cv, a["teacher"], 540, lerp(2500, 1500, e_t) + math.sin(t * 1.3) * 4, sc=1.28, lift=1.0, j=99)
    headline(cv, [a["h1"]], [320], t, 0.35, t_out=3.95)
    headline(cv, [a["h2a"], a["h2b"]], [300, 410], t, 4.35, xs=[520, 570])
    return cv


def platform_screen(cv, a, x0, y0, w, h, t):
    """Illustrative platform view inside the laptop (not a website capture)."""
    scr = Image.new("RGBA", (w, h), (250, 250, 255, 255))
    from PIL import ImageDraw
    d = ImageDraw.Draw(scr)
    d.rectangle((0, 0, w, 54), fill=(255, 255, 255))
    lg = logo_w(150)
    scr.alpha_composite(lg, (18, 27 - lg.height // 2))
    for i, ww in enumerate((70, 70, 90)):
        d.rounded_rectangle((w - 300 + i * 95, 20, w - 300 + i * 95 + ww, 34), radius=7, fill=(222, 218, 234))
    d.rectangle((0, 55, w, h), fill=LILAC)
    for gx in range(0, w, 34):
        d.line((gx, 55, gx, h), fill=(224, 216, 250), width=2)
    for gy in range(55, h, 34):
        d.line((0, gy, w, gy), fill=(224, 216, 250), width=2)
    cx, cy = w / 2, 55 + (h - 55) / 2
    pts = [(-200, -80), (210, -90), (-230, 75), (220, 85), (-20, 128), (10, -125)]
    for i, (px, py) in enumerate(pts):
        tt = t - 0.5 - i * 0.32
        if tt <= 0:
            continue
        stroke_path(scr, a["dot_p"], [(cx, cy), (cx + px, cy + py)], frac=eo(clamp(tt / 0.45)), gap=11)
    av = a["avatar_t"]
    s = pop(t, 0.15, 0.5)
    if s > 0:
        im = av.resize((max(1, int(av.width * s)), max(1, int(av.height * s))), Image.BICUBIC)
        paste(scr, im, cx - im.width / 2, cy - im.height / 2)
    for i, (px, py) in enumerate(pts):
        s = pop(t, 0.9 + i * 0.32, 0.45)
        if s <= 0:
            continue
        m = a["mini"][i]
        im = m.resize((max(1, int(m.width * s * 0.8)), max(1, int(m.height * s * 0.8))), Image.BICUBIC)
        paste(scr, im, cx + px - im.width / 2, cy + py - im.height / 2)
    paste(cv, scr, x0, y0)


def scene2(t):
    a = A()
    cv = BG(1).copy()
    dx, dy = fl(t, 1.1, 12, 10)
    put(cv, a["blob_big"], 120 + dx, 1650 + dy, rot=t * 1.5, lift=0.5)
    put(cv, a["blob_lav"], 980 - dx, 260 - dy, sc=0.8, rot=-t * 2, lift=0.5)
    # logo card unfolds, then moves up
    u = eob(prog(t, 0.3, 0.7), 1.2)
    mv = eio(prog(t, 3.9, 0.8))
    if u > 0:
        put(cv, a["logocard"], 540, lerp(620, 300, mv), sc=lerp(1.0, 0.8, mv), sy=max(0.01, u), rot=lerp(-2, -1, mv),
            lift=1.3, j=5)
    # chalkboard (traditional classroom) -> laptop (online)
    s = pop(t, 1.2, 0.6)
    out = eio(prog(t, 3.9, 0.7))
    if s > 0 and out < 1:
        put(cv, a["chalk"], lerp(540, -650, out), 1180 + dy * 0.5, sc=s * 1.12, rot=lerp(-2, -16, out), lift=1.3, j=6)
    e = eo(prog(t, 4.15, 0.8))
    if e > 0:
        lx, ly, lr = lerp(1750, 540, e), 1110, lerp(10, 0, e)
        put(cv, a["laptop"], lx, ly, sc=1.25, rot=lr, lift=1.4)
        if e >= 1:
            b = a["laptop_box"]
            sc = 1.25
            lw, lh = a["laptop"].w * sc, a["laptop"].h * sc
            x0, y0 = lx - lw / 2 + b[0] * sc, ly - lh / 2 + b[1] * sc
            platform_screen(cv, a, x0, y0, int((b[2] - b[0]) * sc), int((b[3] - b[1]) * sc), t - 4.95)
    headline(cv, [a["h3a"], a["h3b"]], [1500, 1596], t, 5.3, xs=[520, 580])
    return cv


def scene3(t):
    a = A()
    cv = BG(2).copy()
    headline(cv, [a["h4a"], a["h4b"]], [290, 400], t, 0.3, xs=[520, 570])
    e = eo(prog(t, 0.4, 0.8))
    if e <= 0:
        return cv
    cy = lerp(2700, 1095, e)
    put(cv, a["pcard"], 540, cy, rot=lerp(5, -0.6, e), lift=1.4)
    top = cy - 520
    w = eo(prog(t, 0.9, 0.5))
    if w > 0:
        put(cv, a["cover"], 540, top + 92, sx=w, lift=0)
    put(cv, a["avatar_big"], 540, top + 200, sc=pop(t, 1.1, 0.55), lift=1.2, j=3)
    put(cv, a["namebars"], 540, top + 370, sc=pop(t, 1.45, 0.45), lift=0)
    for i, r in enumerate(a["rows"]):
        k = eo(prog(t, 1.9 + i * 0.55, 0.55))
        if k > 0:
            put(cv, r, lerp(1500, 540, k), top + 500 + i * 122, rot=lerp(6, (-0.8, 0.6, -0.4, 0.7)[i], k), lift=1.1,
                j=10 + i)
    for i, (x, y, r) in enumerate(((235, 585, -7), (850, 840, 6), (185, 1525, -4), (895, 1560, 5))):
        s = pop(t, 5.3 + i * 0.3, 0.5)
        if s > 0:
            ox, oy = fl(t, i * 2.1, 4, 6)
            put(cv, a["chips"][i], x + ox, y + oy, sc=s, rot=r, lift=1.4, j=20 + i)
    s = pop(t, 8.6, 0.5)
    if s > 0:
        put(cv, a["check"], 850, 640, sc=s, rot=8, lift=1.4, j=25)
        put(cv, a["check_lab"], 850, 740, sc=pop(t, 8.8, 0.45), rot=-3, lift=1.1)
    return cv


def _ring_xy(i, n, rx, ry, cx=540, cy=1080, off=-90):
    ang = math.radians(off + i * 360 / n + (hsh(i, 3) * 9))
    return cx + rx * math.cos(ang), cy + ry * math.sin(ang)


def scene4(t):
    a = A()
    cv = BG(3).copy()
    dx, dy = fl(t, 2.2, 10, 12)
    put(cv, a["blob_big"], 540 + dx, 1090 + dy, sc=1.05, rot=t * 1.2, lift=0.4)
    headline(cv, [a["h5a"]], [290], t, 0.3)
    headline(cv, [a["h5b"]], [400], t, 5.0, xs=[560])
    s = pop(t, 0.9, 0.5)
    if s > 0:
        put(cv, a["eye"], 935, 175, sc=s * 0.95, rot=10 + math.sin(t * 2) * 4, lift=1.3, j=4)
    # phones, then they slide outward to make room for the network
    P = [((260, 860, -9), (120, 660, -14)), ((820, 900, 8), (965, 690, 12)), ((540, 1420, -2), (540, 1700, 0))]
    o = eio(prog(t, 4.6, 0.9))
    for i, ((x0, y0, r0), (x1, y1, r1)) in enumerate(P):
        s = pop(t, 0.45 + i * 0.2, 0.55)
        if s <= 0:
            continue
        ox, oy = fl(t, i * 1.3, 5, 7)
        put(cv, a["phone_s"], lerp(x0, x1, o) + ox, lerp(y0, y1, o) + oy, sc=s * lerp(0.5, 0.36, o),
            rot=lerp(r0, r1, o), lift=1.3, j=40 + i)
    # profile card travelling phone -> phone -> hub
    legs = [((260, 860), (820, 900), 1.2), ((820, 900), (540, 1420), 2.5), ((540, 1420), (540, 1080), 3.8)]
    for i, ((ax, ay), (bx, by), t0) in enumerate(legs):
        if t0 <= t < t0 + 1.1:
            u = eio(prog(t, t0, 1.1))
            x = lerp(ax, bx, u)
            y = lerp(ay, by, u) - math.sin(u * math.pi) * 220
            put(cv, a["minicard"], x, y, sc=0.95 + math.sin(u * math.pi) * 0.15, rot=lerp(-8, 8, u), lift=2.0)
        arr = t - (t0 + 1.1)
        if 0 <= arr < 0.6 and i < 2:
            put(cv, a["ring"], bx, by, sc=0.8 + arr * 2.2, op=1 - arr / 0.6, lift=0)
    # network: hub + students appearing along dotted links
    if t >= 4.9:
        n = 10
        for i in range(n):
            x, y = _ring_xy(i, n, 365, 430)
            t0 = 5.3 + i * 0.4
            if t > t0:
                dotted_line(cv, a["dot_p"], 540, 1080, x, y, frac=eo(clamp((t - t0) / 0.4)), gap=18)
        for i in range(6):
            x, y = _ring_xy(i, 6, 470, 560, off=-30)
            t0 = 9.6 + i * 0.25
            if t > t0:
                dotted_line(cv, a["dot_i"], 540, 1080, x, y, frac=eo(clamp((t - t0) / 0.4)), gap=22,
                            op=0.5)
        put(cv, a["hub"], 540, 1080, sc=pop(t, 4.85, 0.5) * 1.05, lift=1.6, j=50)
        if 4.9 <= t < 5.7:
            put(cv, a["ring"], 540, 1080, sc=1.0 + (t - 4.9) * 1.6, op=1 - (t - 4.9) / 0.8, lift=0)
        for i in range(n):
            x, y = _ring_xy(i, n, 365, 430)
            s = pop(t, 5.65 + i * 0.4, 0.5)
            if s > 0:
                ox, oy = fl(t, i, 4, 5)
                put(cv, a["people"][i], x + ox, y + oy, sc=s, lift=1.2, j=60 + i)
        for i in range(6):
            x, y = _ring_xy(i, 6, 470, 560, off=-30)
            s = pop(t, 9.95 + i * 0.25, 0.45)
            if s > 0:
                put(cv, a["people"][10 + i], x, y, sc=s * 0.62, lift=1.0, j=70 + i)
        for k, (i, t0) in enumerate(((1, 7.0), (4, 8.0), (7, 9.0), (9, 10.6))):
            x, y = _ring_xy(i, n, 365, 430)
            s = pop(t, t0, 0.45)
            if s > 0:
                put(cv, a["bubble" if k % 2 == 0 else "bubble2"], x + 70, y - 70, sc=s, rot=(-8, 6)[k % 2], lift=1.3)
    return cv


def scene5(t):
    a = A()
    cv = BG(4).copy()
    # top panel: online
    e1 = eo(prog(t, 0.25, 0.75))
    if e1 > 0:
        px = lerp(-700, 540, e1)
        put(cv, a["panel1"], px, 610, rot=lerp(-6, -1, e1), lift=1.2)
        sh = px - 540
        lap = a["laptop"]
        put(cv, lap, 540 + sh, 650, sc=1.0, lift=1.2)
        if e1 >= 1:
            b = a["laptop_box"]
            x0, y0 = 540 - lap.w / 2 + b[0], 650 - lap.h / 2 + b[1]
            sw, shh = b[2] - b[0], b[3] - b[1]
            scr = Image.new("RGBA", (sw, shh), (238, 234, 250, 255))
            tc = a["teacher_crop"]
            th = shh - 10
            tcs = tc.resize((int(tc.width * th / tc.height), th), Image.LANCZOS)
            scr.alpha_composite(tcs, (-10, shh - th))
            from PIL import ImageDraw
            d = ImageDraw.Draw(scr)
            d.rounded_rectangle((sw - 300, 26, sw - 22, shh - 120), radius=10, fill=(255, 255, 255))
            cx0, cy0 = sw - 280, shh - 140
            d.line((cx0, cy0, sw - 40, cy0), fill=(190, 186, 204), width=3)
            d.line((cx0, cy0, cx0, 46), fill=(190, 186, 204), width=3)
            pts = [(cx0 + 10, cy0 - 20), (cx0 + 60, cy0 - 70), (cx0 + 110, cy0 - 55), (cx0 + 160, cy0 - 130),
                   (cx0 + 210, cy0 - 115), (cx0 + 248, cy0 - 185)]
            stroke_path(scr, a["dot_p"], pts, frac=eo(prog(t, 1.4, 2.2)), gap=2)
            for k, (qx, qy) in enumerate(pts):
                if prog(t, 1.4, 2.2) * (len(pts) - 1) >= k:
                    d.ellipse((qx - 7, qy - 7, qx + 7, qy + 7), fill=SAFFRON)
            gt = a["girl_tile"]
            scr.alpha_composite(gt, (sw - 22 - gt.width, shh - 14 - gt.height))
            d.rounded_rectangle((sw - 200, shh - 64, sw - 120, shh - 44), radius=10, fill=PURPLE)
            paste(cv, scr, x0, y0)
        s = pop(t, 0.9, 0.5)
        put(cv, a["tag_on"], 270 + sh, 310, sc=s, rot=-4, lift=1.2, j=81)
        put(cv, a["ic_video"], 130 + sh, 300, sc=s, rot=-10, lift=1.2)
        put(cv, a["x2"], 930 + sh, 330, sc=pop(t, 1.3, 0.5) * 0.75, rot=9, lift=1.3, j=82)
    # bottom panel: in person
    e2 = eo(prog(t, 2.6, 0.75))
    if e2 > 0:
        px = lerp(1780, 540, e2)
        sh = px - 540
        put(cv, a["panel2"], px, 1340, rot=lerp(6, 1, e2), lift=1.2)
        put(cv, a["teacher_s"], 330 + sh, 1385 + math.sin(t * 1.2) * 3, sc=0.62, lift=0.8)
        put(cv, a["boy_s"], 765 + sh, 1420 + math.sin(t * 1.4 + 1) * 3, sc=0.72, lift=0.8)
        put(cv, a["desk"], 540 + sh, 1592, lift=1.0)
        put(cv, a["notebook2"], 545 + sh, 1555, sc=0.5, sx=1.25, sy=0.55, rot=-3, lift=0.6)
        put(cv, a["books"], 860 + sh, 1560, sc=0.48, rot=2, lift=0.8)
        if e2 >= 1:
            nx, ny = 545, 1560
            tri = [(nx - 60, ny + 30), (nx + 60, ny + 30), (nx - 60, ny - 35), (nx - 60, ny + 30)]
            stroke_path(cv, a["dot_t"], tri, frac=eo(prog(t, 3.6, 1.6)), gap=2)
        s = pop(t, 3.15, 0.5)
        put(cv, a["tag_in"], 320 + sh, 1050, sc=s, rot=-3, lift=1.2, j=83)
        put(cv, a["ic_house"], 120 + sh, 1040, sc=s, rot=-8, lift=1.2)
        put(cv, a["sigma"], 945 + sh, 1060, sc=pop(t, 3.5, 0.5) * 0.7, rot=8, lift=1.3, j=84)
    put(cv, a["ou"], 540, 975, sc=pop(t, 3.4, 0.5), rot=-6, lift=1.5, j=85)
    return cv


TARGETS = [(175, 640), (910, 600), (150, 1250), (930, 1210)]


def scene6(t):
    a = A()
    cv = BG(5).copy()
    dx, dy = fl(t, 0.7, 12, 10)
    put(cv, a["blob_big"], 980 + dx, 1700 + dy, rot=t * 2, lift=0.5)
    put(cv, a["blob_lav"], 60 - dx, 900 - dy, sc=0.9, rot=-t * 2, lift=0.5)
    headline(cv, [a["h6a"]], [250], t, 0.3)
    headline(cv, [a["h6b"]], [355], t, 4.2, xs=[560])
    e = eo(prog(t, 0.2, 0.8))
    sc = 1.15
    ph = a["phone_big"]
    py = lerp(2800, 1110, e) + math.sin(t * 1.1) * 3
    put(cv, ph, 540, py, sc=sc, lift=1.6)
    bx, by = a["btn"]
    sw, shh = 420 - 32, 860 - 32
    bcx = 540 + (16 + bx * sw / 480 - 210) * sc
    bcy = py + (16 + by * shh / 980 - 430) * sc
    if e >= 1:
        for k in range(2):
            tt = t - 1.0 - k * 0.3
            if 0 <= tt < 0.7:
                put(cv, a["ring_w"], bcx, bcy, sc=0.5 + tt * 2.0, sy=0.45, op=1 - tt / 0.7, lift=0)
    for i, (x, y) in enumerate(TARGETS):
        s = pop(t, 1.7 + i * 0.2, 0.5)
        if s <= 0:
            continue
        hit = t - (2.0 + i * 0.35 + 0.75)
        bump = 1 + (0.18 * math.sin(hit / 0.35 * math.pi) if 0 <= hit < 0.35 else 0)
        ox, oy = fl(t, i * 1.9, 5, 6)
        put(cv, a["targets"][i], x + ox, y + oy, sc=s * bump, rot=(-8, 7, -5, 9)[i], lift=1.4, j=90 + i)
        for k in range(2):
            ss = pop(t, 4.4 + i * 0.18 + k * 0.1, 0.45)
            if ss > 0:
                mx = x + (-80 if x > 540 else 80) * (1 if k == 0 else 0.3) + (0 if k == 0 else (-1 if x > 540 else 1) * 10)
                my = y + (110 if k == 0 else -110)
                put(cv, a["people"][(i * 2 + k) % 16], mx, my, sc=ss * 0.62, lift=1.0, j=95 + i * 2 + k)
    if e >= 1:
        for i, (x, y) in enumerate(TARGETS):
            t0 = 2.0 + i * 0.35
            if t0 <= t < t0 + 0.75:
                u = eio(prog(t, t0, 0.75))
                cx = lerp(bcx, x, u)
                cy = lerp(bcy, y, u) - math.sin(u * math.pi) * 160
                put(cv, a["linkchip"], cx, cy, sc=lerp(1.0, 0.45, u ** 2), rot=lerp(0, (-8, 7, -5, 9)[i], u), lift=1.8)
    return cv


def scene7(t):
    a = A()
    cv = BG(6).copy()
    dx, dy = fl(t, 0.2, 8, 10)
    put(cv, a["blob_big"], 540 + dx, 940 + dy, sc=lerp(0.4, 1.0, eo(prog(t, 0, 0.9))), rot=t * 1.5, lift=0.4)
    els = [  # sprite, final xy, rot, from xy, sc, t0
        ("pi", (150, 600), -9, (-300, 300), 0.8, 0.05), ("bubble", (930, 640), 9, (1400, 300), 1.0, 0.12),
        ("pin", (125, 1430), -6, (-300, 1500), 0.8, 0.2), ("phone_mini", (960, 1440), 8, (1450, 1500), 0.28, 0.27),
        ("books", (230, 1660), 3, (-400, 2200), 0.75, 0.34), ("notebook", (860, 1690), 10, (1400, 2300), 0.55, 0.4),
        ("x2", (560, 1660), -4, (560, 2400), 0.7, 0.48), ("sigma", (940, 160), 6, (1300, -300), 0.6, 0.55),
        ("plus", (130, 170), -8, (-300, -300), 0.7, 0.6),
    ]
    for i, (k, (x, y), r, (fx, fy), s, t0) in enumerate(els):
        e = eo(prog(t, t0, 0.9))
        if e <= 0:
            continue
        ox, oy = fl(t, i * 1.4, 5, 7)
        put(cv, a[k], lerp(fx, x, e) + ox * e, lerp(fy, y, e) + oy * e, sc=s, rot=lerp(r * 4, r, e), lift=1.3, j=110 + i)
    # paper-fold reveal of the logo card
    fold_y = 930
    ft, fb, fbk = a["fold_top"], a["fold_bot"], a["fold_back"]
    hh = ft.h
    ap = eo(prog(t, 0.2, 0.35))
    if ap > 0:
        bump = 1 + 0.03 * math.sin(clamp((t - 1.25) / 0.3) * math.pi)
        f = eio(prog(t, 0.45, 0.85))
        sy = -math.cos(f * math.pi)
        if f >= 1:
            put(cv, a["logocard"], 540, fold_y, sc=bump, lift=1.6, j=120)
        else:
            put(cv, fb, 540, fold_y + hh / 2, op=ap, lift=1.6)
            if sy < 0:
                put(cv, fbk, 540, fold_y + abs(sy) * hh / 2, sy=max(abs(sy), 0.01), op=ap, lift=2.4)
            else:
                put(cv, ft, 540, fold_y - sy * hh / 2, sy=max(sy, 0.01), lift=2.4 * (1 - sy) + 1.6 * sy)
    headline(cv, [a["h7a"], a["h7b"]], [330, 440], t, 1.0, xs=[520, 570])
    s = pop(t, 2.8, 0.55)
    if s > 0:
        put(cv, a["slogan"], 540, 1235, sc=s, rot=-1.5, lift=1.3, j=130)
    s = pop(t, 3.3, 0.55)
    if s > 0:
        put(cv, a["web"], 540, 1360, sc=s * (1 + 0.02 * math.sin(t * 3)), rot=1.2, lift=1.4, j=131)
    return cv


SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7]
TRANS = ["rip_up", "slide_left", "rip_diag", "drop", "rip_side", "rise"]

# ---------------------------------------------------------------- transitions

_Y = np.arange(H, dtype=np.float32)[:, None]
_X = np.arange(W, dtype=np.float32)[None, :]


@functools.lru_cache(None)
def _prof(seed, n):
    return (noise1d(n, seed, smooth=30, mix=0.65) * 16).astype(np.float32), \
        (6 + np.abs(noise1d(n, seed + 1, smooth=4, mix=0.3)) * 9).astype(np.float32)


def _compose(Aimg, Bimg, showB, fringe, shade):
    out = np.where(showB[..., None], Bimg, Aimg).astype(np.float32)
    out *= shade[..., None]
    out = np.where(fringe[..., None], np.array(PAPER, np.float32) * 0.98, out)
    return out


def transition(kind, Aimg, Bimg, p, seed):
    """Aimg/Bimg: float32 HxWx3. Torn-paper wipes with a fibrous white edge and a contact shadow."""
    if kind in ("rip_up", "rip_diag"):
        prof, fr = _prof(seed, W)
        tilt = (0.22 if kind == "rip_diag" else 0.05) * (_X[0] - W / 2)
        yl = (lerp(H + 140, -320, p) + prof + tilt)[None, :]
        showB = _Y > yl
        fringe = (_Y <= yl) & (_Y > yl - fr[None, :])
        d = _Y - yl
        shade = np.where(showB, 1 - 0.35 * np.exp(-np.maximum(d, 0) / 22), 1).astype(np.float32)
        return _compose(Aimg, Bimg, showB, fringe, shade)
    if kind == "rip_side":
        prof, fr = _prof(seed, H)
        xl = (lerp(-200, W + 200, p) + prof + 0.08 * (np.arange(H) - H / 2))[:, None]
        showB = _X < xl
        fringe = (_X >= xl) & (_X < xl + fr[:, None])
        shade = np.where(showB, 1 - 0.35 * np.exp(-np.maximum(xl - _X, 0) / 22), 1).astype(np.float32)
        return _compose(Aimg, Bimg, showB, fringe, shade)
    # sliding panels: B moves in over A with a torn leading edge
    if kind == "slide_left":
        prof, fr = _prof(seed, H)
        off = int(lerp(W + 60, 0, p))
        Bs = np.zeros_like(Bimg)
        if off < W:
            Bs[:, off:] = Bimg[:, :W - off]
        xe = (off + prof * 0.8)[:, None]
        showB = _X >= xe
        fringe = (_X >= xe) & (_X < xe + fr[:, None]) & (off > 0)
        shade = np.where(~showB, 1 - 0.4 * np.exp(-np.maximum(xe - _X, 0) / 30) - 0.15 * p, 1).astype(np.float32)
        return _compose(Aimg, Bs, showB, fringe, shade)
    if kind in ("drop", "rise"):
        prof, fr = _prof(seed, W)
        if kind == "drop":
            off = int(lerp(-H - 60, 0, p))
            Bs = np.zeros_like(Bimg)
            if off > -H:
                Bs[:H + off] = Bimg[-off:]
            ye = (H + off + prof * 0.8)[None, :]
            showB = _Y < ye
            fringe = (_Y < ye) & (_Y > ye - fr[None, :]) & (off < 0)
            shade = np.where(~showB, 1 - 0.4 * np.exp(-np.maximum(_Y - ye, 0) / 30) - 0.15 * p, 1).astype(np.float32)
        else:
            off = int(lerp(H + 60, 0, p))
            Bs = np.zeros_like(Bimg)
            if off < H:
                Bs[off:] = Bimg[:H - off]
            ye = (off + prof * 0.8)[None, :]
            showB = _Y >= ye
            fringe = (_Y >= ye) & (_Y < ye + fr[None, :]) & (off > 0)
            shade = np.where(~showB, 1 - 0.4 * np.exp(-np.maximum(ye - _Y, 0) / 30) - 0.15 * p, 1).astype(np.float32)
        return _compose(Aimg, Bs, showB, fringe, shade)
    raise ValueError(kind)


@functools.lru_cache(None)
def _finish():
    vy = (_Y - H / 2) / (H / 2)
    vx = (_X - W / 2) / (W / 2)
    vig = 1 - 0.10 * np.clip(vx ** 2 * 0.6 + vy ** 2 * 0.5, 0, 1) ** 1.5
    return (vig * (1 + 0.014 * GRAIN)).astype(np.float32)


def scene_img(k, t):
    CLOCK["t"] = t
    return np.asarray(SCENES[k](t - ST[k]).convert("RGB"), dtype=np.float32)


def frame(t):
    k = max(i for i, s in enumerate(ST) if s <= t + 1e-6)
    B = scene_img(k, t)
    lt = t - ST[k]
    if k > 0 and lt < TD:
        Aim = scene_img(k - 1, t)
        out = transition(TRANS[k - 1], Aim, B, eio(lt / TD), 200 + k)
    else:
        out = B
    out = out * _finish()[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def render_chunk(args):
    i0, i1, path = args
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
           "-pix_fmt", "yuv420p", "-x264-params", "keyint=60", path]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(i0, i1):
        pr.stdin.write(frame(i / FPS).tobytes())
    pr.stdin.close()
    pr.wait()
    return path


def main():
    os.makedirs(OUT, exist_ok=True)
    if sys.argv[1] == "preview":
        for ts in sys.argv[2:]:
            Image.fromarray(frame(float(ts))).save(os.path.join(OUT, f"still_{float(ts):05.2f}.png"))
        return
    n = int(os.environ.get("PROCS", "4"))
    bounds = np.linspace(0, NF, n * 3 + 1).astype(int)
    jobs = [(int(bounds[i]), int(bounds[i + 1]), os.path.join(OUT, f"part_{i:02d}.mp4")) for i in range(len(bounds) - 1)]
    with Pool(n) as pool:
        parts = pool.map(render_chunk, jobs, chunksize=1)
    with open(os.path.join(OUT, "parts.txt"), "w") as f:
        for p in parts:
            f.write(f"file '{p}'\n")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i",
                    os.path.join(OUT, "parts.txt"), "-c", "copy", os.path.join(OUT, "video_silent.mp4")], check=True)
    for p in parts:
        os.remove(p)


if __name__ == "__main__":
    main()
