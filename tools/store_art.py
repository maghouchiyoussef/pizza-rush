import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
ROOT = Path(__file__).resolve().parent.parent; RAW = Path(sys.argv[1])
F = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
INK = (43, 24, 64); YEL = (255, 198, 46); RED = (232, 65, 47)

def text_outline(d, xy, s, font, fill, stroke, w):
    d.text(xy, s, font=font, fill=fill, stroke_width=w, stroke_fill=stroke)

# Feature graphic 1024x500
bg = Image.open(ROOT / 'www/img/nap.jpg').convert('RGB')
bg = bg.resize((1024, int(bg.height * 1024 / bg.width))).crop((0, 120, 1024, 620))
grad = Image.new('L', (1024, 500)); gd = ImageDraw.Draw(grad)
for x in range(1024): gd.line([(x, 0), (x, 500)], fill=int(max(0, 200 - x * 0.32)))
dark = Image.new('RGB', (1024, 500), INK); bg = Image.composite(dark, bg, grad)
chef = Image.open(ROOT / 'www/img/chef.png').convert('RGBA')
ch = chef.resize((int(chef.width * 470 / chef.height), 470))
sh = Image.new('RGBA', ch.size, (0, 0, 0, 0)); sh.putalpha(ch.getchannel('A').point(lambda v: v * 0.45))
bg = bg.convert('RGBA')
bg.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)), (1024 - ch.width - 40, 42))
bg.alpha_composite(ch, (1024 - ch.width - 50, 30))
d = ImageDraw.Draw(bg)
f1 = ImageFont.truetype(F, 92)
f1 = ImageFont.truetype(F, 120)
for i, (s, c) in enumerate([('PIZZA', YEL), ('RUSH', (255, 255, 255))]):
    text_outline(d, (52, 60 + i * 135), s, f1, c, INK, 8)
f2 = ImageFont.truetype(F, 30)
d.rounded_rectangle((52, 362, 520, 418), 28, fill=RED)
d.text((76, 371), 'Bake pizzas around the world!', font=f2, fill=(255, 255, 255))
bg.convert('RGB').save(ROOT / 'store/feature-1024x500.png')

# Captioned phone screenshots 1080x2160
caps = {
 '01_title.png': ('Your pizzeria', 'around the world', (214, 52, 44)),
 '02_nap.png': ('Bake it golden', 'in Naples!', (46, 139, 58)),
 '03_nyc.png': ('Pepperoni', 'in New York', (214, 52, 44)),
 '04_tyo.png': ('Corn & teriyaki', 'in Tokyo', (42, 58, 106)),
 '05_ist.png': ('Spicy pizza', 'in Istanbul', (30, 90, 168)),
 '06_bom.png': ('Paneer pizza', 'in Mumbai', (232, 160, 32)),
 '07_rio.png': ('Beach pizza', 'in Rio', (31, 165, 138)),
 '08_world.png': ('6 cities,', '60 levels', (214, 52, 44)),
 '09_shop.png': ('Upgrade', 'your pizzeria', (60, 196, 106)),
}
out = ROOT / 'store/screenshots'; out.mkdir(parents=True, exist_ok=True)
for f in out.glob('*'): f.unlink()
fc = ImageFont.truetype(F, 92)
for name, (a, b, col) in caps.items():
    W, H = 1080, 2160
    can = Image.new('RGB', (W, H), col); cd = ImageDraw.Draw(can)
    for k, s in enumerate((a, b)):
        w = cd.textlength(s, font=fc)
        text_outline(cd, ((W - w) / 2, 70 + k * 112), s, fc, (255, 255, 255) if k == 0 else YEL, INK, 6)
    shot = Image.open(RAW / name).convert('RGB')
    sw = int(W * 0.84); shh = int(shot.height * sw / shot.width)
    shot = shot.resize((sw, shh), Image.LANCZOS)
    m = Image.new('L', shot.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, sw, shh), 48, fill=255)
    x, y = (W - sw) // 2, 330
    cd.rounded_rectangle((x - 12, y - 12, x + sw + 12, y + shh + 12), 58, fill=INK)
    can.paste(shot, (x, y), m)
    can.crop((0, 0, W, min(H, y + shh + 70))).resize((W, H)) if False else None
    can.save(out / name.replace('.png', '.jpg'), quality=90)
print('ok')
