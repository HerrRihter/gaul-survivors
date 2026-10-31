# Frame animation art (docs/PLAN-NEXT.md, stage A): cuts generated sheets into frames of one scale and axis.
#
# A sheet (tools/make_prompts_gaul.py frames) holds nine figures in a rough 3×3 grid: figure 1 a calibration figure standing like the
# approved <art>_idle, figures 2–9 the frames in reading order. The generator does not keep to the grid (31.10: on 81 sheets of 91 a
# spear, a net or a cape crossed a grid line, and cutting by the grid clipped it and brought a neighbour's piece in), so the sheet is
# cut by whole figures instead:
#  - the nine largest connected shapes are the figures, each taken by the grid cell that holds its centre; a sheet whose figures do
#    not fall one to a cell (two merged, one missing) is refused, never cut by guess: it goes back to the generator;
#  - every smaller shape (a thrown fish, a flying stone, an arrow, a splash) joins the figure it lies nearest to;
#  - a figure touching the sheet's edge is cut off by the canvas: reported, the frame is kept.
# Scale: BODY heights (thin things — a spear, a staff, helmet wings — eroded away) are matched to the idle's, so every action shares the
# idle's scale. A walk sheet uses the median of its nine figures; an attack sheet the calibration figure or its last READY frame,
# whichever agrees with the walk sheet; the idle stands IDLE_H px tall. Feet: the bottom edge; axis: the centroid of the thick mass
# between 20% and 70% of the height, padded to the centre. What the cut found goes to art/gen/<art>_<action>_cut.json (tools/frames-audit.py).
#
#   python tools/frames.py <art> <action> <names, comma-separated>     e.g. hr_asterix walk walk0,...,walk7
#   python tools/frames.py <art> model idle --single                     a model pose (one figure) → the approved <art>_idle
import json, os, sys
from PIL import Image
from scipy import ndimage
import numpy as np
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
IDLE_H = 256                                    # texture px of a standing character
CUT = 60                                        # alpha above this is the drawing

def mask(im): return np.array(im.getchannel('A')) > CUT

def shapes(im):
    """Connected shapes of the drawing (a 2 px bridge closes hairline gaps inside one figure): label image and their pixel counts."""
    lab, n = ndimage.label(ndimage.binary_dilation(mask(im), iterations=2))
    return lab, np.bincount(lab.ravel())[1:] if n else np.array([])

def body_h(im):                                  # the height of the thick mass: thin protrusions eroded away
    m = mask(im); ys = np.nonzero(m.any(1))[0]; fh = ys[-1] - ys[0]
    e = ndimage.binary_erosion(m, iterations=max(1, int(fh * 0.02))); ys = np.nonzero(e.any(1))[0]
    return ys[-1] - ys[0]

def axis(im):                                    # centroid of the thick mass between 20% and 70% of the height from the top
    m = mask(im); ys = np.nonzero(m.any(1))[0]; top, fh = ys[0], ys[-1] - ys[0]
    e = ndimage.binary_erosion(m, iterations=max(1, int(fh * 0.03)))[top + int(fh * 0.2): top + int(fh * 0.7)]
    xs = np.nonzero(e)[1]; return xs.mean() if len(xs) else im.width / 2

def place(im):                                   # feet at the bottom edge, the axis at the centre
    im = im.crop(im.getbbox()); mid = axis(im); half = int(max(mid, im.width - mid) + 0.5)
    out = Image.new('RGBA', (half * 2, im.height)); out.paste(im, (half - int(mid + 0.5), 0)); return out

def resize(im, k): return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)

def cut_sheet(sheet):
    """The nine figures of a sheet in reading order, each with the loose pieces nearest to it, and what went wrong."""
    W, H = sheet.size; lab, size = shapes(sheet); issues = []
    order = np.argsort(size)[::-1]; figs = [i + 1 for i in order[:9]]
    if len(figs) < 9: return None, ['only %d shapes on the sheet' % len(figs)]
    cells = {}
    for f in figs:
        ys, xs = np.nonzero(lab == f); c = min(2, int(ys.mean() * 3 / H)) * 3 + min(2, int(xs.mean() * 3 / W))
        cells.setdefault(c, []).append(f)
    if len(cells) < 9 or any(len(v) > 1 for v in cells.values()):
        return None, ['figures merged or out of place: cells ' + ' '.join(f'{c + 1}:{len(v)}' for c, v in sorted(cells.items()))]
    owner = {cells[c][0]: c for c in cells}
    small = size[figs[-1] - 1] * 0.15                       # a loose piece much smaller than any figure (else: a stray figure)
    dist = {f: ndimage.distance_transform_edt(lab != f) for f in figs}
    groups = {f: [f] for f in figs}
    for i in order[9:]:
        s = i + 1; ys, xs = np.nonzero(lab == s)
        near = min(figs, key=lambda f: dist[f][ys, xs].min()); groups[near].append(s)
        if size[i] > small: issues.append(f'a stray shape of {size[i]} px joined to figure {owner[near] + 1}')
        elif dist[near][ys, xs].min() > W / 6: issues.append(f'a loose piece of {size[i]} px far from figure {owner[near] + 1}')
    a = np.array(sheet); out = []
    for c in range(9):
        f = cells[c][0]; keep = np.isin(lab, groups[f]); fa = a.copy(); fa[..., 3] = np.where(keep, a[..., 3], 0)
        ys, xs = np.nonzero(keep)
        if ys.min() <= 1 or xs.min() <= 1 or ys.max() >= H - 2 or xs.max() >= W - 2: issues.append(f'figure {c + 1} cut by the canvas edge')
        im = Image.fromarray(fa); out.append(im.crop(im.getbbox()))
    return out, issues

if __name__ == '__main__':
    art = sys.argv[1]; action, names = sys.argv[2], sys.argv[3].split(',')
    if '--single' in sys.argv:                   # a model pose: the approved idle, at the texture height
        im = Image.open(f'art/gen/{art}_{action}.png').convert('RGBA'); lab, size = shapes(im)
        a = np.array(im); a[..., 3] = np.where(lab == np.argmax(size) + 1, a[..., 3], 0); im = Image.fromarray(a); im = im.crop(im.getbbox())
        im = place(resize(im, IDLE_H / im.height)); im.save(f'art/gen/{art}_{names[0]}.png'); print(f'{art}_{names[0]}: {im.size}'); sys.exit()
    sheet = Image.open(f'art/gen/{art}_{action}_sheet.png').convert('RGBA')
    cells, issues = cut_sheet(sheet); rep = f'art/gen/{art}_{action}_cut.json'
    if cells is None:
        json.dump({'refused': True, 'issues': issues}, open(rep, 'w'), indent=1); sys.exit(f'{art} {action}: REFUSED — {issues[0]} (regenerate the sheet)')
    idle = Image.open(f'art/gen/{art}_idle.png').convert('RGBA')
    ib = body_h(idle); kf = f'art/gen/{art}_walk_scale.txt'
    cand = []
    if action == 'walk':
        k = ib / float(np.median([body_h(c) for c in cells])); open(kf, 'w').write(f'{k:.5f}')
    else:
        cand = [ib / body_h(cells[0]), ib / body_h(cells[6])]; kw = float(open(kf).read()) if os.path.exists(kf) else cand[0]
        k = min(cand, key=lambda c: abs(c - kw))
    frames = []
    for cell, n in zip(cells[1:], names):
        im = place(resize(cell, k)); im.save(f'art/gen/{art}_{n}.png'); frames.append({'name': n, 'w': im.width, 'h': im.height, 'body': int(body_h(im))})
    json.dump({'refused': False, 'scale': round(k, 4), 'standing': [round(c, 4) for c in cand], 'issues': issues, 'frames': frames}, open(rep, 'w'), indent=1)
    print(f'{art} {action}: scale {k:.3f}, {len(frames)} frames' + ''.join('\n  ! ' + s for s in issues))
