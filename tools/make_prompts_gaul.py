# The Gaul setting's art (docs/PLAN-GAUL.md, stage 2: the trial slice). Every part is its own request, as round 24 learned (whole
# sheets come back with bent limbs): the body first against the character's original design, then each limb against that body.
#   python tools/make_prompts_gaul.py a      → art/jobs_gaul_a.json: the bodies, Asterix's sword, the plaza props
#   python tools/make_prompts_gaul.py b      → art/jobs_gaul_b.json: legs, feet and arms (needs the phase a bodies in art/gen)
#   python tools/make_prompts_gaul.py b foot → only the jobs whose name has 'foot' (any words: a redraw of some parts)
# The style bible and the style reference (Image 1, a 1976 film cel) come from ref2game.json on this branch.
import json, os, sys
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
phase = sys.argv[1] if len(sys.argv) > 1 else 'a'

USE = 'Use case: ONE part for cut-out rig animation in a top-down 3/4 survivors-like game set in a Gaulish village of 50 BC.'
FINISH = ('Line and finish: the clean cel look of Image 1: one even crisp dark brown-black outline (#2a1a12) around every shape, flat bright '
          'colours with one soft shadow tone and a small highlight, NO paint texture on the character, NO noise, NO wobbly edges.')
LAST = 'Constraints: one single part, nothing else, no text, no letters, no ground, no shadow under it, no glow, transparent background, not cut by the canvas edge.'

# who: (asset prefix, design reference, body description, leg, foot, arm)
CHARS = {
    'hr_asterix': ('art/refs/gaul/asterix_design.jpg',
        'Asterix the Gaul, the small clever hero: the white rounded helmet with two white-grey feathered wings on its sides, long straw-blond hair '
        'falling to the shoulders, a huge blond moustache, a big round pink nose, small determined black eyes, a cheeky confident half-smile; '
        'a black sleeveless tunic, a broad green belt with three round gold studs, and the small blue-grey gourd of magic potion hanging at the belt on his left. '
        'Proportions: a very big head (about half of the body\'s height) on a short compact torso.',
        'his red trousers: ONE leg in red cloth (#d8332a) with soft folds',
        'ONE big low cartoon shoe in soft brown leather (#7a4a22), like his in Image 3: long, low and rounded with a bulbous toe and a flat dark sole, NO cuff, '
        'NO boot shaft, open at the top where the trouser leg comes in; about two and a half times as long as it is tall; seen from the side, the toe pointing right',
        'ONE bare arm in pink skin (#f2b5a0), slim, with a big cartoon hand closed in a fist at the bottom'),
    'legion': ('art/refs/gaul/legion_design.jpg',
        'the thin Roman legionary: a domed iron helmet with long cheek guards hanging down the sides of the face, a long sad face, drooping eyelids, '
        'a long pink nose, a thin neck; a green tunic (#3f7d3a) under grey segmented iron shoulder armour (lorica), a brown leather belt. '
        'Proportions: a big head on narrow shoulders and a thin torso. Do NOT draw his shield or spear.',
        'ONE thin bare leg in pink skin (#f0b098) with a small round knee',
        'ONE bare cartoon foot in pink skin (#f0b098) in a flat brown leather Roman sandal (#6a3f1c): a thin flat sole, two or three thin straps across the foot, '
        'the bare toes showing at the front, NO high straps up the ankle; about two and a half times as long as it is tall; seen from the side, the toe pointing right',
        'ONE thin bare arm in pink skin (#f0b098) with a short green tunic sleeve cap at the shoulder and a big cartoon fist at the bottom'),
}

def body_job(k):
    ref, desc, *_ = CHARS[k]
    p = '\n'.join([USE,
        'Image 2 is the ORIGINAL DESIGN of this character: match his face, headgear, hair, clothes and colours exactly so players recognise him at a glance; only re-render him in the style of Image 1.',
        'Subject: ' + desc,
        'Draw ONLY the BODY as a rig part, upright, facing the viewer in a front 3/4 view, centred: the head and the torso in ONE piece, NO legs and NO arms '
        '(the hips and the shoulders closed and complete, smoothly rounded where the limbs attach), nothing hanging below the hips except the hem of the clothes.',
        FINISH, LAST])
    return {'name': k + '_bodyonly', 'prompt': p, 'size': '1024x1024', 'alpha': 'auto', 'ref': [{'path': ref, 'label': 'the original design of this character'}]}

def limb_jobs(k):
    ref, _, leg, foot, arm = CHARS[k]
    body = f'art/gen/{k}_bodyonly.png'
    if not os.path.exists(body): sys.exit(f'{body} is missing: run phase a first')
    refs = [{'path': body, 'label': "this character's approved body: copy its colours, outline and finish"}, {'path': ref, 'label': 'the original design of this character'}]
    common = [USE, 'Image 2 is this character\'s approved body part; Image 3 is his original design. The limb must look like it belongs to Image 2.']
    jobs = []
    jobs.append({'name': k + '_legonly', 'size': '1024x1024', 'alpha': 'auto', 'ref': refs, 'prompt': '\n'.join(common + [
        'Draw ONLY ' + leg + ', as a rig part: perfectly STRAIGHT and VERTICAL, centred on the canvas — the hip end at the top is a plain rounded cap exactly as wide as '
        'the leg and centred on it (nothing sticking out sideways); thigh and shin in ONE straight vertical line, NO bend, NO angle; the ankle end at the bottom, NO foot, NO shoe.',
        'An even width from top to bottom; the leg is about three times as long as it is wide (short cartoon legs).', FINISH, LAST])})
    jobs.append({'name': k + '_footonly', 'size': '1024x1024', 'alpha': 'auto', 'ref': refs, 'prompt': '\n'.join(common + [
        'Draw ONLY ' + foot + ', as a rig part, centred, resting flat; the opening for the ankle at the top, the sole flat along the bottom.', FINISH, LAST])})
    jobs.append({'name': k + '_armonly', 'size': '1024x1024', 'alpha': 'auto', 'ref': refs, 'prompt': '\n'.join(common + [
        'Draw ONLY ' + arm + ', as a rig part: perfectly STRAIGHT and VERTICAL, centred on the canvas — a round shoulder end at the top, sitting exactly on the arm\'s '
        'centre line; upper arm and forearm in ONE straight vertical line, NO bend at the elbow, NO lean; the fist directly below, centred on the same axis, '
        'seen from the side, not wider than about twice the arm.', FINISH, LAST])})
    return jobs

PROPS = {
    'hut': 'a round Gaulish village hut: a low wall of rough grey fieldstones, a tall golden-straw thatched conical roof, a small wooden door with a dark doorway at the front; '
           'about as wide as it is tall; seen from the 3/4 top-down game camera (the roof\'s top and the front wall both visible)',
    'cauldron': 'the druid\'s big black iron cauldron on three short legs over a small wood fire ringed with stones, a golden-green potion bubbling inside (painted, no glow); '
                'seen from the 3/4 top-down game camera',
    'menhir': 'one tall grey standing stone (menhir), rough and slightly leaning, mossy at the foot, about three times as tall as it is wide; seen from the 3/4 top-down game camera',
}
def prop_job(k):
    return {'name': k, 'size': '1024x1024', 'alpha': 'auto', 'prompt': '\n'.join([
        'Use case: ONE world prop for a top-down 3/4 survivors-like game set in a Gaulish village of 50 BC, in the painted gouache scenery style of Image 1.',
        'Subject: ' + PROPS[k] + '.', 'Draw it alone, complete and centred, its base on an invisible ground line.',
        'Constraints: one single object, no ground, no grass patch, no shadow, no text, transparent background, not cut by the canvas edge.'])}

SWORD = {'name': 'sword_gen', 'size': '1536x1024', 'alpha': 'auto', 'ref': [{'path': 'art/refs/gaul/asterix_design.jpg', 'label': "the hero's design (his sword hangs at his belt)"}],
    'prompt': '\n'.join([USE,
        "Subject: Asterix's short sword held as a weapon, lying HORIZONTAL and pointing RIGHT: the grip on the left with a round gold pommel and a small gold crossguard, "
        'a short broad straight steel blade with a rounded point on the right, the blade about three times as long as the grip; slim — about six times as long as it is tall.',
        'Centred on the canvas.', FINISH, LAST])}

if phase == 'a': jobs = [body_job(k) for k in CHARS] + [SWORD] + [prop_job(k) for k in PROPS]
elif phase == 'b': jobs = [j for k in CHARS for j in limb_jobs(k) if not sys.argv[2:] or any(w in j['name'] for w in sys.argv[2:])]
else: sys.exit('phase: a | b')
out = f'art/jobs_gaul_{phase}.json'
json.dump(jobs, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(out, len(jobs), 'jobs:', ' '.join(j['name'] for j in jobs))
