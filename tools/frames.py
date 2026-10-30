# Frame animation art for the Gauls (docs/PLAN-GAUL.md, stage 3): cuts generated sheets into game frames of one scale and axis.
#
# A sheet (tools/make_prompts_gaul.py frames) is a 3×3 grid: cell 1 a calibration figure standing like the approved <art>_idle, cells
# 2–9 the frames in reading order. Cells are cut by the grid, not by connected shapes (a cape or a fish touching the next figure merged
# two frames), and inside a cell only the figure that reaches its middle is kept (a neighbour's cape tip is dropped).
#  - scale: BODY heights (thin things — a spear, a staff, helmet wings — eroded away) are matched to the idle's, so every action shares
#    the idle's scale. A walk sheet uses the median of its nine standing figures; an attack sheet the calibration figure or its last
#    READY frame (both standing), whichever agrees with the walk sheet (the generator sometimes draws one of them smaller); then everything is at the project's texture height (the idle stands IDLE_H px tall);
#  - feet: the bottom edge; axis: the centroid of the figure's thick mass between 30% and 80% of its height, padded to the centre.
#
#   python tools/frames.py <art> <action> <names, comma-separated>     e.g. hr_asterix walk walk0,...,walk7
#   python tools/frames.py <art> model idle --single                     a model pose (one figure) → the approved <art>_idle
#   python tools/frames.py <art> --rescale                                every <art>_* frame and its idle back to IDLE_H
import glob, os, subprocess, sys
from PIL import Image, ImageFilter
from scipy import ndimage
import numpy as np
SK = os.path.expanduser('~/.claude/skills/ref2game/scripts')
env = dict(os.environ, PYTHONUTF8='1')
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
IDLE_H = 256                                    # texture px of a standing character (drawn 80–110 view px: 2.3–3.2× oversampled)
FRAME = ('idle', 'walk', 'attack', 'hurt')

def mask(im, cut=60): return np.array(im.getchannel('A')) > cut

def figure(cell):
    """The figure reaching the cell's middle third, alone (stray parts of neighbours removed), cropped to it."""
    m = mask(cell); lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    if n == 0: return None
    h, w = m.shape; mid = lab[h // 3: 2 * h // 3, w // 3: 2 * w // 3]
    ids, cnt = np.unique(mid[mid > 0], return_counts=True)
    keep = ids[np.argmax(cnt)] if len(ids) else np.argmax(np.bincount(lab.ravel())[1:]) + 1
    a = np.array(cell); a[..., 3] = np.where(lab == keep, a[..., 3], 0)
    out = Image.fromarray(a); return out.crop(out.getbbox())

def body_h(im):                                  # the height of the thick mass: thin protrusions eroded away
    m = mask(im); ys = np.nonzero(m.any(1))[0]; fh = ys[-1] - ys[0]
    e = ndimage.binary_erosion(m, iterations=max(1, int(fh * 0.02))); ys = np.nonzero(e.any(1))[0]
    return ys[-1] - ys[0]

def axis(im):                                    # centroid of the thick mass between 30% and 80% of the height from the feet
    m = mask(im); ys = np.nonzero(m.any(1))[0]; top, fh = ys[0], ys[-1] - ys[0]
    e = ndimage.binary_erosion(m, iterations=max(1, int(fh * 0.03)))[top + int(fh * 0.2): top + int(fh * 0.7)]
    xs = np.nonzero(e)[1]; return xs.mean() if len(xs) else im.width / 2

def place(im):                                   # feet at the bottom edge, the axis at the centre
    im = im.crop((0, 0, im.width, im.getbbox()[3])); mid = axis(im); half = int(max(mid, im.width - mid) + 0.5)
    out = Image.new('RGBA', (half * 2, im.height)); out.paste(im, (half - int(mid + 0.5), 0)); return out

def resize(im, k): return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)

def prep(): subprocess.run([sys.executable, f'{SK}/prep.py'], env=env)

art = sys.argv[1]
if '--rescale' in sys.argv:
    idle = Image.open(f'art/gen/{art}_idle.png').convert('RGBA'); k = IDLE_H / idle.height
    for f in sorted(glob.glob(f'art/gen/{art}_*.png')):
        n = os.path.basename(f)[len(art) + 1:-4]
        if n.rstrip('0123456789') not in FRAME: continue
        place(resize(Image.open(f).convert('RGBA'), k)).save(f)
    print(f'{art}: ×{k:.3f} → idle {IDLE_H} px'); prep(); sys.exit()

action, names = sys.argv[2], sys.argv[3].split(',')
if '--single' in sys.argv:                       # a model pose: the approved idle, at the texture height
    im = figure(Image.open(f'art/gen/{art}_{action}.png').convert('RGBA'))
    im = place(resize(im, IDLE_H / im.height)); im.save(f'art/gen/{art}_{names[0]}.png'); print(f'{art}_{names[0]}: {im.size}'); prep(); sys.exit()
sheet = Image.open(f'art/gen/{art}_{action}_sheet.png').convert('RGBA'); W, H = sheet.size
cells = [figure(sheet.crop((c * W // 3, r * H // 3, (c + 1) * W // 3, (r + 1) * H // 3))) for r in range(3) for c in range(3)]
if any(c is None for c in cells): sys.exit(f'{art} {action}: an empty cell')
idle = Image.open(f'art/gen/{art}_idle.png').convert('RGBA')
ib = body_h(idle); kf = f'art/gen/{art}_walk_scale.txt'
if action == 'walk':
    k = ib / float(np.median([body_h(c) for c in cells])); open(kf, 'w').write(f'{k:.5f}')
else:
    cand = [ib / body_h(cells[0]), ib / body_h(cells[6])]; kw = float(open(kf).read()) if os.path.exists(kf) else cand[0]
    k = min(cand, key=lambda c: abs(c - kw)); print(f'  candidates {cand[0]:.3f} (calibration), {cand[1]:.3f} (ready); walk {kw:.3f}')
print(f'{art} {action}: idle body {ib} px: scale {k:.3f}')
for cell, n in zip(cells[1:], names):
    im = place(resize(cell, k)); im.save(f'art/gen/{art}_{n}.png'); print(f'  {art}_{n}: {im.size[0]}x{im.size[1]}')
prep()
