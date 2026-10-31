# The frame manifest of the new art (docs/PLAN-NEXT.md, stage A): which drawings each game character uses and at what size.
# Size comes from the original only: gaul-survivors draws every character frame 1:1 (a 256 px frame, anchor [128, 236]), so the
# median height of a character's original walk frames is its height in world px; the new frames (tools/frames.py, a 256 px idle
# texture) get scale = that height / the median height of the new walk frames. No height is typed anywhere else.
# Writes data/animations/art-frames.json and art/audit/lineup.png (the originals 1:1 above, the new frames at their scale below).
#   python tools/art-manifest.py
import glob, json, os
from PIL import Image, ImageDraw
import numpy as np
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
SRC = 'assets/runtime/characters'
# game id (data/characters/heroes.js, data/enemies/units.js) → (the original's frame folder, the new art's prefix in art/gen)
CAST = {
    'asterix': ('heroes/asterix', 'hr_asterix'), 'obelix': ('heroes/obelix', 'hr_obelix'), 'cacofonix': ('heroes/cacofonix', 'hr_cacofonix'),
    'antisanitarix': ('heroes/antisanitarix', 'hr_antisanitarix'), 'automatix': ('heroes/automatix', 'hr_automatix'),
    'panoramix': ('heroes/panoramix', 'hr_panoramix'),
    'roman': ('enemies/roman-0', 'legion'), 'spear': ('enemies/spear', 'spear'), 'pilum': ('enemies/pilum', 'pilum'),
    'veteran': ('enemies/veteran', 'veteran'), 'auxiliary': ('enemies/auxiliary', 'aux'), 'turtle': ('enemies/turtle', 'turtle'),
    'ram': ('enemies/ram', 'ram'), 'boar': ('enemies/boar', 'boar'), 'stoneSquad': ('enemies/stone-squad', 'stonesq'),
    'netter': ('enemies/netter', 'netter'), 'wine': ('enemies/wine', 'wine'), 'cavalry': ('enemies/cavalry', 'cavalry'),
    'tower': ('enemies/tower', 'tower'), 'caius': ('enemies/caius', 'caius'), 'merchant': ('enemies/merchant', 'merchant'),
    'malosinus': ('enemies/malosinus', 'malosinus'), 'boss': ('enemies/boss', 'centurion'),
}
FRAMES = {'walk': 8, 'attack': 6, 'hurt': 2}
IMPACT = 2                                       # the attack frame the blow lands on (every sheet so far: anticipation, wind-up, strike)
# sizes that are not right yet: the original's frame holds more than the new drawing
NOTE = {'merchant': 'provisional: the original frame includes his stall, the new one does not yet (stage D draws it)'}

def height(paths):
    hs = []
    for p in paths:
        b = Image.open(p).getchannel('A').point(lambda a: 255 if a > 60 else 0).getbbox()
        if b: hs.append(b[3] - b[1])
    return float(np.median(hs))

man, rows = {}, []
for gid, (orig, art) in CAST.items():
    gs = height(glob.glob(f'{SRC}/{orig}/animations/walk/*.png'))
    new = height([f'art/gen/{art}_walk{i}.png' for i in range(8)])
    man[gid] = {'art': art, 'height': round(gs, 1), 'scale': round(gs / new, 4), 'frames': FRAMES, 'impact': IMPACT, **({'note': NOTE[gid]} if gid in NOTE else {})}
    rows.append((gid, Image.open(f'{SRC}/{orig}/animations/walk/0.png').convert('RGBA'), Image.open(f'art/gen/{art}_walk0.png').convert('RGBA'), gs / new))
os.makedirs('data/animations', exist_ok=True)
json.dump({'anchor': 'bottom-centre', 'unit': 'world px (1:1 with the original frames)', 'characters': man},
          open('data/animations/art-frames.json', 'w', encoding='utf-8'), indent=1)

Z = 3                                            # the lineup is drawn 3× so small originals stay readable
tiles = []
for gid, o, n, k in rows:
    o = o.crop(o.getchannel('A').getbbox()); o = o.resize((o.width * Z, o.height * Z), Image.NEAREST)
    n = n.resize((max(1, round(n.width * k * Z)), max(1, round(n.height * k * Z))), Image.LANCZOS)
    tiles.append((gid, o, n))
H = max(max(o.height, n.height) for _, o, n in tiles); W = sum(max(o.width, n.width) + 16 for _, o, n in tiles) + 16
out = Image.new('RGB', (W, H * 2 + 70), (236, 234, 226)); d = ImageDraw.Draw(out); x = 16
for gid, o, n in tiles:
    w = max(o.width, n.width); out.paste(o, (x + (w - o.width) // 2, H + 10 - o.height), o); out.paste(n, (x + (w - n.width) // 2, H * 2 + 40 - n.height), n)
    d.text((x, H * 2 + 48), gid, fill=(60, 50, 40)); x += w + 16
d.text((8, 4), 'gaul-survivors 1:1 (above) · the new frames at their manifest scale (below), both x3', fill=(60, 50, 40))
out.save('art/audit/lineup.png'); print(json.dumps({k: (v['height'], v['scale']) for k, v in man.items()}))
