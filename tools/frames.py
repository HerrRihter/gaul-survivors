# Cuts a 3×3 frame-animation sheet (tools/make_prompts_gaul.py frames) into game frames: cell 1 is a calibration figure standing
# exactly as the approved <art>_idle, cells 2–9 the frames in reading order. Every frame is scaled by one factor (the calibration
# figure's height → the idle pose's height), so all actions share the idle's scale; set feet down at the bottom; and padded so the
# body's axis is the picture's centre (the scene draws a frame centred, feet on the ground point). The axis is the centroid of the
# figure's thick mass between 30% and 80% of its height: the mask is eroded first, so a sword, a spear or a flung arm does not move it.
#   python tools/frames.py <art> <action> <name per frame, comma-separated> [--keep N]   (then prep runs)
#   python tools/frames.py hr_asterix walk walk0,walk1,walk2,walk3,walk4,walk5,walk6,walk7
import os, subprocess, sys, tempfile
from PIL import Image, ImageFilter
SK = os.path.expanduser('~/.claude/skills/ref2game/scripts')
env = dict(os.environ, PYTHONUTF8='1')
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
art, action, names = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
sheet = f'art/gen/{art}_{action}_sheet.png'
cut = [f'_{art}_{action}_cal'] + [f'_{art}_{action}_{i}' for i in range(len(names))]
r = subprocess.run([sys.executable, f'{SK}/slice.py', sheet, ','.join(cut), '--order', 'reading'], env=env, capture_output=True, text=True)
print(r.stdout.strip()[-600:], r.stderr.strip()[-300:])
if r.returncode: sys.exit('slice failed')
idle = Image.open(f'art/gen/{art}_idle.png').getchannel('A').getbbox()
cal = Image.open(f'art/gen/{cut[0]}.png').convert('RGBA'); cb = cal.getchannel('A').getbbox()
k = (idle[3] - idle[1]) / (cb[3] - cb[1])
print(f'{art} {action}: calibration {cb[3] - cb[1]} px tall, idle {idle[3] - idle[1]} px: scale {k:.3f}')
os.remove(f'art/gen/{cut[0]}.png')

def axis(im):
    a = im.getchannel('A').point(lambda v: 255 if v > 60 else 0); w, h = a.size; bb = a.getbbox(); fh = bb[3] - bb[1]
    core = a.filter(ImageFilter.MinFilter(max(3, (int(fh * 0.06) // 2) * 2 + 1)))     # erode by ~6% of the height
    band = core.crop((0, bb[1] + int(fh * 0.2), w, bb[1] + int(fh * 0.7)))           # 30%–80% of the height from the feet
    px = band.load(); sx = n = 0
    for y in range(band.height):
        for x in range(w):
            if px[x, y]: sx += x; n += 1
    return sx / n if n else w / 2

for src, n in zip(cut[1:], names):
    im = Image.open(f'art/gen/{src}.png').convert('RGBA'); os.remove(f'art/gen/{src}.png')
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    im = im.crop((0, 0, im.width, im.getchannel('A').getbbox()[3]))                      # the feet at the bottom edge
    mid = axis(im); half = int(max(mid, im.width - mid) + 0.5)
    out = Image.new('RGBA', (half * 2, im.height)); out.paste(im, (half - int(mid + 0.5), 0))
    out.save(f'art/gen/{art}_{n}.png'); print(f'{art}_{n}: {out.width}x{out.height}, axis {mid:.0f}')
subprocess.run([sys.executable, f'{SK}/prep.py'], env=env)
