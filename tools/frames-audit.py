# The frame audit (docs/PLAN-NEXT.md, stage A): every character's cut frames checked and laid out for the eye.
#  - the cut: a refused sheet (figures merged or missing), a figure cut by the canvas edge, a stray shape (tools/frames.py);
#  - the scale: a walk frame whose body height strays from the walk's median by more than WALK_TOL; an attack sheet whose two standing figures
#    (the calibration and READY) give scales more than ACT_TOL apart (its size is then a guess; crouches and lunges are poses);
#  - the axis: a walk frame whose body centre jumps sideways from the one before by more than JUMP of its height (the figure slides).
# Writes art/audit/<art>.png (idle, walk, attack, hurt in a row; red frames are flagged) and art/audit/report.txt; exits 1 on any flag.
#   python tools/frames-audit.py [art ...]          (no arts: every art with an _idle and cut reports)
import glob, json, os, sys
from PIL import Image, ImageDraw
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from frames import body_h, axis   # noqa: E402  (frames.py moves to the project root)
WALK_TOL, ACT_TOL, JUMP = 0.15, 0.1, 0.08
ACTIONS = {'walk': [f'walk{i}' for i in range(8)], 'attack': [f'attack{i}' for i in range(6)] + ['hurt0', 'hurt1']}
os.makedirs('art/audit', exist_ok=True)
arts = sys.argv[1:] or sorted({os.path.basename(f)[:-len('_walk_cut.json')] for f in glob.glob('art/gen/*_walk_cut.json')})
lines, bad_total = [], 0
for art in arts:
    flags = {}                                   # frame name → reasons
    def flag(n, why): flags.setdefault(n, []).append(why)
    idle = Image.open(f'art/gen/{art}_idle.png').convert('RGBA'); ib = body_h(idle)
    sheet_notes = []
    for action, names in ACTIONS.items():
        rep = f'art/gen/{art}_{action}_cut.json'
        if not os.path.exists(rep): sheet_notes.append(f'{action}: not cut'); continue
        r = json.load(open(rep))
        if r['refused']: sheet_notes.append(f'{action}: REFUSED — ' + '; '.join(r['issues'])); [flag(n, 'sheet refused') for n in names]; continue
        for s in r['issues']:
            sheet_notes.append(f'{action}: {s}')
            if s.startswith('figure ') and 'edge' in s: i = int(s.split()[1]) - 2; i >= 0 and flag(names[i], 'cut by the canvas edge')
        ims = {n: Image.open(f'art/gen/{art}_{n}.png').convert('RGBA') for n in names}
        bh = {n: body_h(im) for n, im in ims.items()}
        if action == 'walk':
            med = float(np.median(list(bh.values())))
            for n in names:
                if abs(bh[n] / med - 1) > WALK_TOL: flag(n, f'body {bh[n]} vs walk median {med:.0f}')
            prev = None
            for n in names:
                im = ims[n]; c = axis(im) - im.width / 2
                if prev is not None and abs(c - prev) > JUMP * im.height: flag(n, f'axis jumps {c - prev:+.0f} px')
                prev = c
        else:
            c = r.get('standing') or []
            if len(c) == 2 and abs(c[0] / c[1] - 1) > ACT_TOL: [flag(n, f'standing figures disagree: scale {c[0]} vs {c[1]}') for n in names]
    # the contact sheet
    row = ['idle'] + ACTIONS['walk'] + ACTIONS['attack']; H = 128
    tiles = []
    for n in row:
        p = f'art/gen/{art}_{n}.png'
        im = Image.open(p).convert('RGBA') if os.path.exists(p) else Image.new('RGBA', (64, 256))
        im = im.resize((max(1, im.width * H // 256), max(1, im.height * H // 256)), Image.LANCZOS); tiles.append((n, im))
    W = sum(t.width + 8 for _, t in tiles) + 8; out = Image.new('RGB', (W, H + 48), (236, 234, 226)); d = ImageDraw.Draw(out); x = 8
    for n, t in tiles:
        y = H + 20 - t.height; out.paste(t, (x, y), t)
        d.line([(x, H + 21), (x + t.width, H + 21)], fill=(150, 140, 120))
        if n in flags: d.rectangle([x - 3, 2, x + t.width + 3, H + 24], outline=(220, 30, 30), width=3)
        d.text((x, H + 28), n, fill=(60, 50, 40)); x += t.width + 8
    out.save(f'art/audit/{art}.png')
    bad = len(flags) + sum('REFUSED' in s or 'stray' in s for s in sheet_notes); bad_total += bad
    lines.append(f'{art}: ' + ('ok' if not bad else f'{len(flags)} frames flagged'))
    lines += ['  sheet ' + s for s in sheet_notes] + [f'  {n}: ' + '; '.join(w) for n, w in flags.items()]
open('art/audit/report.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n'); print('\n'.join(lines))
sys.exit(1 if bad_total else 0)
