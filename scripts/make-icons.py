# Génère le logo de Ma Météo (soleil derrière un nuage, sur un ciel bleu)
# et toutes les images d'icône utilisées par app.json.
#
#   python scripts/make-icons.py
#
# Dessin en très grande taille puis réduction : bords lisses sans dépendance SVG.

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "assets" / "images"
S = 4096  # taille de travail

SKY_TOP = (37, 99, 235)      # bleu vif
SKY_BOTTOM = (12, 30, 78)    # bleu nuit
SUN_IN = (255, 214, 92)
SUN_OUT = (251, 146, 36)
CLOUD = (255, 255, 255)
CLOUD_SHADE = (203, 222, 247)
DROP = (125, 196, 255)


def gradient(size, top, bottom):
    """Dégradé vertical légèrement diagonal."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32) / (size - 1)
    t = np.clip(y * 0.8 + x * 0.2, 0, 1)[..., None]
    rgb = np.array(top) * (1 - t) + np.array(bottom) * t
    alpha = np.full((size, size, 1), 255)
    return Image.fromarray(np.concatenate([rgb, alpha], axis=2).astype(np.uint8), "RGBA")


def radial(size, center, radius, inner, outer):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    d = np.sqrt((x - center[0]) ** 2 + (y - center[1]) ** 2) / radius
    t = np.clip(d, 0, 1)[..., None]
    rgb = np.array(inner) * (1 - t) + np.array(outer) * t
    alpha = np.full((size, size, 1), 255)
    return Image.fromarray(np.concatenate([rgb, alpha], axis=2).astype(np.uint8), "RGBA")


def circle(draw, cx, cy, r, fill):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)


def cloud_mask(size, scale, ox, oy):
    """Silhouette du nuage (coordonnées sur une grille 0..1)."""
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    u = size * scale

    def p(v):
        return v * u

    circle(d, ox + p(0.33), oy + p(0.58), p(0.17), 255)
    circle(d, ox + p(0.56), oy + p(0.47), p(0.24), 255)
    circle(d, ox + p(0.78), oy + p(0.63), p(0.15), 255)
    d.rounded_rectangle(
        (ox + p(0.12), oy + p(0.58), ox + p(0.95), oy + p(0.84)), radius=p(0.13), fill=255
    )
    return m


def draw_logo(size, scale=1.0, offset=(0, 0), mono=False):
    """Soleil + nuage + gouttes, transparent autour. scale=1 remplit tout le carré."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    u = size * scale
    ox = offset[0] + (size - u) / 2
    oy = offset[1] + (size - u) / 2

    # Soleil : halo, rayons, disque
    sx, sy, sr = ox + u * 0.60, oy + u * 0.36, u * 0.20
    if not mono:
        glow = Image.new("L", (size, size), 0)
        circle(ImageDraw.Draw(glow), sx, sy, sr * 1.55, 120)
        glow = glow.filter(ImageFilter.GaussianBlur(u * 0.05))
        img.paste(Image.new("RGBA", (size, size), SUN_IN + (255,)), (0, 0), glow)

    rays = Image.new("L", (size, size), 0)
    rd = ImageDraw.Draw(rays)
    for i in range(8):
        a = np.pi / 4 * i + np.pi / 8
        r1, r2 = sr * 1.28, sr * 1.62
        x1, y1 = sx + np.cos(a) * r1, sy + np.sin(a) * r1
        x2, y2 = sx + np.cos(a) * r2, sy + np.sin(a) * r2
        rd.line((x1, y1, x2, y2), fill=255, width=int(u * 0.045))
        circle(rd, x1, y1, u * 0.0225, 255)
        circle(rd, x2, y2, u * 0.0225, 255)
    disc = Image.new("L", (size, size), 0)
    circle(ImageDraw.Draw(disc), sx, sy, sr, 255)

    if mono:
        white = Image.new("RGBA", (size, size), (255, 255, 255, 255))
        img.paste(white, (0, 0), rays)
        img.paste(white, (0, 0), disc)
    else:
        img.paste(Image.new("RGBA", (size, size), SUN_IN + (255,)), (0, 0), rays)
        img.paste(radial(size, (sx - sr * 0.3, sy - sr * 0.3), sr * 1.3, SUN_IN, SUN_OUT), (0, 0), disc)

    # Nuage : ombre portée, puis nuage avec dégradé clair en bas
    cmask = cloud_mask(size, scale * 0.86, ox - u * 0.02, oy + u * 0.09)
    if mono:
        # Découpe autour du nuage pour qu'il se détache du soleil
        gap = cmask.filter(ImageFilter.MaxFilter(int(u * 0.03) | 1))
        img.putalpha(Image.fromarray(np.minimum(np.array(img.getchannel("A")), 255 - np.array(gap))))
        img.paste(Image.new("RGBA", (size, size), (255, 255, 255, 255)), (0, 0), cmask)
    else:
        shadow = cmask.filter(ImageFilter.GaussianBlur(u * 0.03))
        shadow_layer = Image.new("RGBA", (size, size), (6, 18, 52, 0))
        shadow_layer.putalpha(shadow.point(lambda v: v * 0.45))
        img.alpha_composite(shadow_layer, (int(u * 0.0), int(u * 0.03)))
        cloud = gradient(size, CLOUD, CLOUD_SHADE)
        img.paste(cloud, (0, 0), cmask)

    # Gouttes de pluie sous le nuage
    drops = Image.new("L", (size, size), 0)
    dd = ImageDraw.Draw(drops)
    for dx, dy in ((0.34, 0.91), (0.51, 0.95), (0.68, 0.91)):
        x, y = ox + u * dx, oy + u * dy
        r = u * 0.032
        circle(dd, x, y, r, 255)
        dd.polygon([(x - r * 0.98, y - r * 0.2), (x + r * 0.98, y - r * 0.2), (x, y - r * 2.6)], fill=255)
    color = (255, 255, 255, 255) if mono else DROP + (255,)
    img.paste(Image.new("RGBA", (size, size), color), (0, 0), drops)
    return img


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return m


def save(img, name, px):
    img.resize((px, px), Image.LANCZOS).save(OUT / name, optimize=True)
    print("ok", name, px)


def main():
    background = gradient(S, SKY_TOP, SKY_BOTTOM)

    # Icône classique (iOS, anciens Android, aperçu du widget) : carré plein
    icon = background.copy()
    icon.alpha_composite(draw_logo(S, 0.78))
    save(icon, "icon.png", 1024)

    # Icône adaptative Android : le dessin reste dans la zone sûre (66 % centraux)
    save(background, "android-icon-background.png", 1024)
    save(draw_logo(S, 0.56, (0, 0)), "android-icon-foreground.png", 1024)
    save(draw_logo(S, 0.56, (0, 0), mono=True), "android-icon-monochrome.png", 1024)

    # Écran de démarrage : logo arrondi sur fond transparent (fond bleu nuit dans app.json)
    splash = background.copy()
    splash.alpha_composite(draw_logo(S, 0.78))
    splash.putalpha(rounded_mask(S, int(S * 0.23)))
    save(splash, "splash-icon.png", 512)
    save(splash, "favicon.png", 64)


if __name__ == "__main__":
    main()
