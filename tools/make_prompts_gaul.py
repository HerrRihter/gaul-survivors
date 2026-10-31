# The Gaul setting's art (docs/PLAN-GAUL.md, stage 2: the trial slice). Every part is its own request, as round 24 learned (whole
# sheets come back with bent limbs): the body first against the character's original design, then each limb against that body.
#   python tools/make_prompts_gaul.py a      → art/jobs_gaul_a.json: the bodies, Asterix's sword, the plaza props
#   python tools/make_prompts_gaul.py b      → art/jobs_gaul_b.json: legs, feet and arms (needs the phase a bodies in art/gen)
#   python tools/make_prompts_gaul.py b foot → only the jobs whose name has 'foot' (any words: a redraw of some parts)
#   python tools/make_prompts_gaul.py model [art...]  → the heroes' and enemies' model poses (one standing figure each; tools/frames.py <art> model idle --single)
#   python tools/make_prompts_gaul.py frames [art...] → 3×3 walk and attack sheets for every character with an approved <art>_idle
#   python tools/make_prompts_gaul.py poses  → art/jobs_gaul_poses.json: one sheet of six whole-body poses per character (the rig was
#                                            dropped 28.10: limited animation, poses switched by the scene)
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

POSES = {
    'hr_asterix': ('his short sword in his right hand',
        ['STANDING at rest, relaxed, the sword held low in his right hand',
         'WALKING, mid-stride: the LEFT leg forward, the right leg back, arms swinging',
         'WALKING, mid-stride: the RIGHT leg forward, the left leg back, arms swinging the other way',
         'WIND-UP before a blow: the sword raised high behind his head, the body turned back, knees bent',
         'STRIKE: the sword swung forward in a wide horizontal slash, the sword arm stretched out in front, the body leaning into it, the front leg lunging',
         'HURT: recoiling backwards from a hit, eyes squeezed shut, arms flung up, leaning back']),
    'legion': ('a long spear in his right hand and the big blue rectangular shield with the yellow thunderbolt emblem on his left arm',
        ['STANDING at rest, the spear upright beside him, the shield in front',
         'WALKING, mid-stride: the LEFT leg forward, the right leg back',
         'WALKING, mid-stride: the RIGHT leg forward, the left leg back',
         'WIND-UP before a thrust: the spear drawn back at shoulder height, pointing forward, the body leaning back',
         'THRUST: the spear thrust straight forward, the arm fully stretched, the body leaning into it, the front leg lunging',
         'HURT: recoiling backwards from a hit, the helmet knocked askew, eyes squeezed shut, arms flung up, the spear tilted']),
}

def poses_job(k):
    ref, desc, *_ = CHARS[k]; held, poses = POSES[k]
    body = f'art/gen/{k}_bodyonly.png'
    refs = [{'path': ref, 'label': 'the original design of this character'}] + ([{'path': body, 'label': "this character's approved drawing in this game's style"}] if os.path.exists(body) else [])
    p = '\n'.join([
        'Use case: a POSE SHEET for limited 2D animation (whole-body poses switched one after another, like a 1970s animated film) in a top-down 3/4 survivors-like game set in a Gaulish village of 50 BC.',
        'Image 2 is the ORIGINAL DESIGN of this character' + (" and Image 3 his approved drawing in this game's style" if len(refs) > 1 else '') + ': match his face, headgear, hair, clothes, colours and proportions exactly in every pose.',
        'Subject: ' + desc + ' He holds ' + held + '.',
        'Draw the SAME character SIX times on one canvas, two rows of three, the WHOLE body in every pose (head to feet), seen from the side in a 3/4 view, ALWAYS FACING RIGHT:',
        *[f'{i + 1}) {t};' for i, t in enumerate(poses)],
        'Every pose at EXACTLY the same size and scale, the feet of each row standing on one shared invisible ground line; very wide empty gaps between the poses, nothing touching or overlapping, nothing cut by the canvas edge.',
        FINISH,
        'Constraints: no text, no letters, no numbers, no ground, no shadows under the feet, no glow, no motion lines, no speed streaks, transparent background.'])
    return {'name': k + '_poses_sheet', 'prompt': p, 'size': '1536x1024', 'alpha': 'auto', 'ref': refs}

# frame animation (28.10, the owner: six poses move too coarsely): a 3×3 sheet per action; cell 1 is the character standing exactly as
# his approved idle pose (a calibration frame: tools/frames.py scales the sheet by it and drops it), cells 2–9 the frames in reading order
FRAMES = {
    'hr_asterix': {
        'walk': ('a smooth WALK CYCLE of eight evenly spaced frames (one full stride, both legs), the arms swinging against the legs, '
                 'the sword in his right hand pointing down and back',
                 ['CONTACT: the left heel touching down in front, the right leg straight behind',
                  'DOWN: the weight on the left leg, its knee bent, the body at its lowest',
                  'PASSING: the right leg passing under the body, the body rising',
                  'UP: on the toes of the left foot, the body at its highest, the right leg swinging forward',
                  'CONTACT: the right heel touching down in front, the left leg straight behind',
                  'DOWN: the weight on the right leg, its knee bent, the body at its lowest',
                  'PASSING: the left leg passing under the body, the body rising',
                  'UP: on the toes of the right foot, the body at its highest, the left leg swinging forward']),
        'attack': ('a sword ATTACK of six frames, then two HURT frames',
                 ['ANTICIPATION: crouching a little, the sword drawn back low behind him',
                  'WIND-UP: the sword raised high behind his head, the body twisted back',
                  'STRIKE: the sword slashing forward in a wide horizontal arc, the arm fully extended, lunging on the front leg',
                  'FOLLOW-THROUGH: the sword swept on past the front and down, the body twisted forward',
                  'RECOVER: pulling the sword back, rising from the lunge',
                  'READY: back in a ready stance, the sword held forward',
                  'HURT: recoiling backwards from a hit, eyes squeezed shut, arms flung up',
                  'HURT, recovering: stumbling back onto both feet, wincing']),
    },
}

# the other five heroes (stage 3): design reference (their gaul-survivors frames, enlarged), look, what they hold, the attack's six frames
HERO_CAST = {
    'hr_obelix': ('art/refs/gaul/obelix_design.png',
        'Obelix the Gaul, the huge strong menhir carrier: an enormous round belly and bare pink chest and arms, long red hair in two braids tied with small blue bows, '
        'a big bushy red moustache, a big round pink nose, a cheerful face; blue-and-white vertical striped trousers, a broad green belt with gold studs and a big round '
        'gold buckle, brown shoes. Proportions: very wide and round, a big head, short legs.',
        'nothing in his hands', 'his big arms swinging',
        ['ANTICIPATION: crouching, both hands gripping a grey menhir standing on the ground in front of him',
         'WIND-UP: the grey menhir hoisted high above his head in both hands, leaning back',
         'THROW: both arms flung forward, the menhir just leaving his hands towards the right',
         'FOLLOW-THROUGH: arms stretched out forward and empty, leaning into the throw',
         'RECOVER: straightening up, arms coming back',
         'READY: standing, fists on his hips, pleased']),
    'hr_cacofonix': ('art/refs/gaul/cacofonix_design.png',
        'Cacofonix the bard: a slim young Gaul with long wavy golden-blond hair, a small blond moustache, a big pink nose, a smug face; a green tunic, a red cape over '
        'his shoulders, blue-and-white striped trousers, brown shoes; a small golden lyre in his left hand.',
        'his small golden lyre', 'the lyre held at his chest',
        ['ANTICIPATION: taking a deep breath, chest puffed out, the lyre raised',
         'WIND-UP: head thrown back, eyes shut, the hand lifted over the lyre strings',
         'SINGING: mouth wide open bellowing a terrible note, strumming the lyre hard, leaning forward',
         'SINGING ON: still bellowing, eyes squeezed shut, the cape flying back',
         'LAST NOTE: mouth closing, the hand off the strings',
         'READY: standing proudly, the lyre at his chest']),
    'hr_antisanitarix': ('art/refs/gaul/antisanitarix_design.png',
        'Unhygienix the fishmonger: a stocky Gaul with blond hair and a big blond moustache, a big pink nose; a white shirt with rolled-up sleeves, a white apron, '
        'blue trousers, brown shoes; a big grey-green fish held by its tail.',
        'a big grey-green fish by its tail', 'the fish dangling from his hand',
        ['ANTICIPATION: gripping the fish by its tail, drawing it back low',
         'WIND-UP: the fish swung back over his shoulder',
         'THROW: the arm whipped forward, the fish flying out of his hand towards the right',
         'FOLLOW-THROUGH: the empty hand stretched forward, leaning into the throw',
         'RECOVER: pulling a new fish out from behind his apron',
         'READY: standing, the new fish held by its tail']),
    'hr_automatix': ('art/refs/gaul/automatix_design.png',
        'Fulliautomatix the blacksmith: a big burly Gaul with bushy red hair and a big red beard and moustache, a big nose, a fierce face; bare muscular pink arms, '
        'a brown leather smith apron over his bare chest, dark green trousers, brown shoes; a heavy blacksmith hammer.',
        'his heavy blacksmith hammer in his right hand', 'the hammer swinging low at his side',
        ['ANTICIPATION: gripping the hammer in both hands, crouching',
         'WIND-UP: the hammer raised high over his head in both hands',
         'SMASH: the hammer brought down hard in front of him, the body bent forward',
         'FOLLOW-THROUGH: the hammer head on the ground in front, the knees bent',
         'RECOVER: lifting the hammer back up',
         'READY: standing, the hammer resting on his shoulder']),
    'hr_panoramix': ('art/refs/gaul/panoramix_design.png',
        'Getafix the old druid: a tall thin old man with a very long white beard down to his knees, long white hair, a big nose, wise eyes; a long white robe, '
        'a red cape, a golden sickle at his belt, brown shoes; a wooden walking staff in his left hand and a small green potion flask in his right.',
        'his wooden staff and a small green potion flask', 'leaning a little on his staff',
        ['ANTICIPATION: pulling the cork out of the green potion flask',
         'WIND-UP: the flask raised high, ready to fling',
         'FLING: the flask swung forward, green potion splashing out in an arc towards the right',
         'FOLLOW-THROUGH: the arm stretched forward, the last green drops falling',
         'RECOVER: corking the flask',
         'READY: standing, leaning on his staff']),
}
HURT = ['HURT: recoiling backwards from a hit, eyes squeezed shut, arms flung up', 'HURT, recovering: stumbling back onto both feet, wincing']
FRAMES['legion'] = {'walk': ('a smooth WALK CYCLE of eight evenly spaced frames (one full stride, both legs), marching, the spear upright in his right hand and the shield on his left arm', FRAMES['hr_asterix']['walk'][1]),
    'attack': ('a spear ATTACK of six frames, then two HURT frames', ['ANTICIPATION: the spear drawn back at shoulder height, the shield forward',
        'WIND-UP: leaning back, the spear cocked behind him, pointing forward', 'THRUST: the spear thrust straight forward, the arm fully stretched, lunging on the front leg',
        'FOLLOW-THROUGH: the spear still forward, the body leaning past it', 'RECOVER: pulling the spear back, rising from the lunge', 'READY: standing, the spear upright, the shield in front'] + HURT)}
for _k, (_ref, _desc, _held, _arms, _atk) in HERO_CAST.items():
    CHARS[_k] = (_ref, _desc, '', '', '')
    FRAMES[_k] = {'walk': (f'a smooth WALK CYCLE of eight evenly spaced frames (one full stride, both legs), {_arms}', FRAMES['hr_asterix']['walk'][1]),
                  'attack': ('an ATTACK of six frames, then two HURT frames', _atk + HURT)}

# the enemies (stage 3, the owner 31.10: only gaul-survivors units, each on the mechanic of the NetSurvivors foe it replaces):
# art: (design reference, look, what it holds, its standing model pose, the walk, the walk's eight frames or None for a man's
# stride, the attack's six frames under its mechanic, the two hurt frames or None for a man's)
def _ref(k): return f'art/refs/gaul/{k}_design.png'
MAN = 'STANDING at rest, the WHOLE body (head to feet), feet together'
GROUP_HURT = ['HURT: the whole group recoiling backwards from a hit, eyes squeezed shut, ducking', 'HURT, recovering: steadying themselves, wincing']
GALLOP = lambda who: [f'{who} gathered, all four legs under the body', f'{who} pushing off with the hind legs', f'{who} stretched out flying, the forelegs reaching forward',
                      f'{who} landing on the forelegs', f'{who} gathered again, legs under the body', f'{who} pushing off again with the hind legs',
                      f'{who} stretched out, the hind legs kicking back', f'{who} landing, the forelegs taking the weight']
ENEMY_CAST = {
    'aux': (_ref('aux'), 'an auxiliary Roman soldier: a round iron helmet, a red face with a big ginger moustache and a big pink nose, grey segmented iron shoulder armour '
        'over a green tunic, a brown belt, brown sandals; a round blue shield with a yellow sunburst emblem on his left arm.',
        'a long spear in his right hand and the round blue shield on his left arm', MAN, 'marching, the spear upright', None,
        ['ANTICIPATION: crouching, the spear drawn back at the hip', 'WIND-UP: leaning back, the spear cocked',
         'LUNGE: a long lunge forward, the spear thrust straight out', 'FOLLOW-THROUGH: stretched out on the front leg, the spear forward',
         'RECOVER: pulling the spear back, rising', 'READY: standing, the spear upright'], None),
    'spear': (_ref('spear'), 'a thin young Roman spearman: a round iron helmet, a long sad face, a long pink nose, grey segmented iron shoulder armour over a green tunic, '
        'a brown belt, brown sandals; a rectangular blue shield with a yellow thunderbolt emblem on his left arm.',
        'a long spear in his right hand and the blue rectangular shield on his left arm', MAN, 'marching briskly, the spear upright', None,
        ['ANTICIPATION: the spear levelled at the hip, pointing forward', 'JAB: a quick short jab forward', 'RECOIL: the spear pulled back',
         'JAB: a second quick jab, lunging further', 'RECOVER: pulling the spear back', 'READY: standing, the spear upright'], None),
    'boar': (_ref('boar'), 'a big angry wild boar: shaggy dark-brown bristly fur, a ridge of bristles along the back, small fierce red-brown eyes under a frowning brow, '
        'a pink snout, two big curved white tusks, short dark legs with small black hooves, a thin tail with a tuft.',
        'nothing (it is an animal)', 'STANDING on all four legs, the WHOLE animal', 'a trotting run on all four legs', GALLOP('the boar'),
        ['ANTICIPATION: the head lowered, scraping the ground with a front hoof, snorting', 'WIND-UP: crouched back on the hind legs, the tusks aimed forward',
         'CHARGE: launching forward, the body stretched out, the tusks first', 'CHARGE ON: stretched out flying forward, the forelegs reaching',
         'IMPACT: tossing the head up, the tusks hooking upward', 'RECOVER: standing on four legs, snorting'],
        ['HURT: the boar recoiling backwards on its haunches, squealing, eyes squeezed shut', 'HURT, recovering: shaking its head, back on four legs']),
    'turtle': (_ref('turtle'), 'a Roman TESTUDO: FOUR legionaries (round iron helmets, long pink noses, green tunics, brown sandals) marching close together in a block, '
        'their big rectangular blue shields with yellow thunderbolt emblems locked into a wall in front and a roof over their heads.',
        'the locked blue shields', 'STANDING at rest as one block, all four legionaries\' feet on one ground line', 'the whole block marching in step, the legs alternating',
        None,
        ['ANTICIPATION: the block braced, the shields locked tight', 'WIND-UP: short swords drawn back behind the front shields',
         'STAB: the short swords thrust out forward between the front shields', 'FOLLOW-THROUGH: the swords out, the block leaning forward',
         'RECOVER: the swords pulled back behind the shields', 'READY: the block standing, the shields locked'], GROUP_HURT),
    'veteran': (_ref('veteran'), 'a stocky battle-hardened Roman veteran: a round iron helmet with a short red crest, a grim scowling face, a big pink nose, grey segmented '
        'iron armour over a green tunic, a dark red cape, brown sandals; a big rectangular blue shield with a yellow thunderbolt emblem on his left arm.',
        'a short Roman sword (gladius) in his right hand and the blue shield on his left arm', MAN, 'a heavy steady march, the sword low, the cape swinging', None,
        ['ANTICIPATION: the shield raised forward, the sword drawn back', 'WIND-UP: the sword raised high over his shoulder',
         'SLASH: the sword swung down and forward in a heavy cut, stepping in', 'FOLLOW-THROUGH: the sword swept low past the front',
         'RECOVER: pulling the sword back behind the shield', 'READY: standing, the shield forward'], None),
    'pilum': (_ref('pilum'), 'a thin Roman javelin thrower: a round iron helmet, a long pink nose, grey segmented iron shoulder armour over a green tunic, a quiver of '
        'javelins on his back, brown sandals; a small round blue shield with a yellow emblem on his left arm.',
        'a javelin (pilum) in his right hand and the small round shield on his left arm', MAN, 'marching, the javelin upright', None,
        ['ANTICIPATION: the javelin raised level with the ear, aiming', 'WIND-UP: leaning back, the throwing arm drawn far behind',
         'THROW: the arm whipped forward, the javelin leaving the hand towards the right', 'FOLLOW-THROUGH: the empty hand stretched forward',
         'RECOVER: drawing a new javelin from the quiver on his back', 'READY: standing, the new javelin upright'], None),
    'tower': (_ref('tower'), 'a Roman SIEGE TOWER: a tall square wooden tower of brown planks with cross braces and a ladder on its side, four big wooden wheels with '
        'iron rims at the bottom, and on the open platform on top two Roman archers (round iron helmets, long noses, green tunics) with bows.',
        'the archers\' bows', 'STANDING still, the WHOLE tower with its wheels on the ground line', 'rolling forward, the wheels turning a little more in each frame, '
        'the tower rocking gently, the archers swaying on top',
        ['rolling, the wheels turned a little', 'rolling, the tower tilting slightly forward', 'rolling, the archers bobbing', 'rolling, the tower upright',
         'rolling, the wheels turned further', 'rolling, the tower tilting slightly back', 'rolling, the archers bobbing the other way', 'rolling, the tower upright again'],
        ['ANTICIPATION: the archers nocking arrows', 'DRAW: both archers drawing their bows, aiming outwards in different directions',
         'VOLLEY: arrows loosed from both bows', 'FOLLOW-THROUGH: the bows lowered, the archers reaching for new arrows',
         'RELOAD: nocking new arrows', 'READY: the archers standing on the platform, bows held'],
        ['HURT: the whole tower rocking back from a hit, the archers ducking, eyes squeezed shut', 'HURT, recovering: the tower settling back on its wheels']),
    'stonesq': (_ref('stonesq'), 'a SQUAD of three Roman legionaries (round iron helmets, long pink noses, grey shoulder armour over green tunics, brown sandals) marching '
        'side by side and carrying one huge grey boulder above their heads on their raised arms.',
        'the huge grey boulder above their heads', 'STANDING at rest, the boulder held above their heads, all their feet on one ground line',
        'marching in step under the boulder, the legs alternating', None,
        ['ANTICIPATION: the squad bending their knees, the boulder lowered to their shoulders', 'WIND-UP: heaving, the boulder pushed up high',
         'THROW: arms flung forward and up, the boulder leaving their hands in a high arc towards the right', 'FOLLOW-THROUGH: arms stretched up and empty, watching it fly',
         'RECOVER: a new boulder lifted from the ground between them', 'READY: the new boulder held above their heads'], GROUP_HURT),
    'netter': (_ref('netter'), 'a sneaky Roman ambusher: a round iron helmet, a sly face, a long pink nose, grey segmented iron shoulder armour over a green tunic, '
        'a long dark-green hooded cloak, brown sandals; a coiled rope net hanging from his hands.',
        'a coiled rope net', MAN + ', crouching a little', 'creeping forward sneakily, bent low, the net in both hands', None,
        ['ANTICIPATION: crouching, the net gathered in both hands', 'WIND-UP: whirling the net round over his head',
         'CAST: the net flung out wide around him, spreading open', 'FOLLOW-THROUGH: the net spread wide on the ground in front, him leaning forward',
         'RECOVER: hauling the net back in', 'READY: crouching, the coiled net in his hands'], None),
    'wine': (_ref('wine'), 'a round-faced Roman legionary wine-bearer: a round iron helmet, a red tipsy face, a big pink nose, grey segmented iron armour over a green tunic '
        'with purple wine stains, brown sandals; a small wine barrel strapped on his back.',
        'a red clay wine jug in his right hand', MAN, 'a jaunty weaving walk, the wine jug swinging', None,
        ['ANTICIPATION: raising the jug, a sly grin', 'WIND-UP: the jug drawn back over his shoulder',
         'SPLASH: the jug swung forward, purple wine splashing out towards the right', 'FOLLOW-THROUGH: the jug tipped forward, the last purple drops falling',
         'RECOVER: refilling the jug from the barrel on his back', 'READY: standing, the jug at his hip'], None),
    'merchant': (_ref('merchant'), 'a plump bald market merchant: a round bald head with a dark fringe of hair, bushy eyebrows, a big pink nose, a bored frown; a white tunic '
        'with a red border, brown sandals. Do NOT draw his market stall.',
        'a wicker basket of red apples, round loaves and a small clay amphora on his left arm', MAN, 'waddling along, the basket on his arm', None,
        ['ANTICIPATION: picking a red apple out of the basket', 'WIND-UP: the apple drawn back over his shoulder',
         'LOB: tossing the apple up in a high arc towards the right', 'FOLLOW-THROUGH: the empty hand up, watching it fly',
         'RECOVER: reaching into the basket for a loaf', 'READY: standing, the basket on his arm'], None),
    'ram': (_ref('ram'), 'a Roman BATTERING RAM: a heavy wooden frame on four big iron-rimmed wooden wheels, a long log hanging from chains under the frame with a grey '
        'iron ram\'s head at its front end; three Roman legionaries (round iron helmets, long noses, green tunics, sandals) pushing it from behind and the sides.',
        'the battering ram', 'STANDING still, the WHOLE machine and its crew, the wheels and feet on one ground line',
        'pushed forward, the crew leaning in and stepping in step, the wheels turning', None,
        ['ANTICIPATION: the crew hauling the hanging log back on its chains', 'WIND-UP: the log pulled far back, the crew straining',
         'SMASH: the log swung forward hard, the iron ram\'s head bashing out in front', 'FOLLOW-THROUGH: the log at its furthest forward, the crew lurching',
         'RECOVER: the log swinging back', 'READY: the log hanging still, the crew braced'], GROUP_HURT),
    'caius': (_ref('caius'), 'Caius Bonus, the pompous Roman centurion of the nearest camp: a big gold helmet with a tall red crest, a fat red face, a big nose, a black '
        'moustache, a gold cuirass over a green tunic, a red cape, brown sandals; short and stout.',
        'nothing, his fists clenched', MAN, 'a pompous strut, chest out, the cape swinging', None,
        ['ANTICIPATION: drawing a deep breath, chest puffed out', 'WIND-UP: the right arm raised high, the fist clenched',
         'COMMAND: bellowing an order, mouth wide open, the arm flung forward pointing', 'COMMAND ON: still bellowing, both arms spread wide',
         'RECOVER: lowering the arms, huffing', 'READY: standing, fists on the hips'], None),
    'cavalry': (_ref('cavalry'), 'a Roman CAVALRYMAN on horseback: a chestnut-brown horse with a dark mane and tail and a red saddle cloth; the rider in a round iron '
        'helmet, a long pink nose, grey shoulder armour over a green tunic, a round blue shield with a yellow sunburst emblem.',
        'a long lance in the rider\'s right hand and the round shield on his left arm', 'STANDING still, the WHOLE horse on four legs with the rider sitting upright',
        'a galloping horse, the rider bobbing in the saddle, the lance levelled', GALLOP('the horse'),
        ['ANTICIPATION: the horse rearing slightly, the rider drawing a javelin back', 'WIND-UP: the rider\'s arm far back, aiming',
         'THROW: the rider flinging a javelin forward towards the right', 'FOLLOW-THROUGH: the rider\'s arm stretched forward, the horse lunging',
         'RECOVER: the rider drawing another javelin', 'READY: the horse standing, the rider upright, the lance levelled'],
        ['HURT: the horse rearing back from a hit, the rider clutching the reins, eyes squeezed shut', 'HURT, recovering: the horse back on four legs, shaking its head']),
    'malosinus': (_ref('malosinus'), 'Malosinus the Roman treasurer: a tall thin bald man with a long hooked nose and a sour sneer, a light green tunic with a gold-trimmed '
        'collar under a dark green toga draped over one shoulder, red trousers, white sandals.',
        'a big brown leather money bag stamped with a gold coin in his left hand', MAN, 'a stiff haughty walk, the money bag swinging', None,
        ['ANTICIPATION: hefting the money bag in both hands', 'WIND-UP: swinging the bag round behind him',
         'SWING: the bag swung round in a wide circle, gold coins spilling out around him', 'SWING ON: the bag carried on round, coins flying',
         'RECOVER: catching the bag back to his chest', 'READY: standing, the bag clutched to his side'], None),
    'centurion': (_ref('centurion'), 'Centurion Maximus, the commander of the Roman camps: a big gold helmet with a tall transverse red crest, a fierce red face, a big nose, '
        'a black moustache, a gold muscled cuirass over a green tunic, a long red cape, brown sandals; broad and imposing.',
        'a short Roman sword (gladius) in his right hand', MAN, 'a heavy commanding march, the sword low, the cape billowing', None,
        ['ANTICIPATION: the sword drawn back, a furious shout', 'WIND-UP: the sword raised high over his head',
         'SLASH: the sword swung down and forward in a mighty cut, stepping in', 'FOLLOW-THROUGH: the sword swept low past the front, the cape flying',
         'RECOVER: pulling the sword back up', 'READY: standing, the sword pointed forward'], None),
}
for _k, (_ref_, _desc, _held, _stand, _walk, _wf, _atk, _hurt) in ENEMY_CAST.items():
    CHARS[_k] = (_ref_, _desc, '', '', '')
    FRAMES[_k] = {'walk': (f'a smooth WALK CYCLE of eight evenly spaced frames (one full cycle), {_walk}', _wf or FRAMES['hr_asterix']['walk'][1]),
                  'attack': ('an ATTACK of six frames, then two HURT frames', _atk + (_hurt or HURT))}

def model_jobs(k):
    if k in ENEMY_CAST: ref, desc, held, stand, *_ = ENEMY_CAST[k]
    else: (ref, desc, held, _, _), stand = HERO_CAST[k], MAN
    p = '\n'.join([
        'Use case: the MODEL POSE of a character for a frame-by-frame animated (1970s hand-drawn film) top-down 3/4 survivors-like game set in a Gaulish village of 50 BC.',
        'Image 2 is the ORIGINAL DESIGN of this character (small game sprites): match the face, hair, clothes, colours, what is held and the proportions exactly; '
        'redraw it large and clean in the style of Image 1.',
        'Subject: ' + desc + ' Holding ' + held + '.',
        f'Draw it ONCE, {stand}, seen from the side in a 3/4 view, FACING RIGHT, centred, on an invisible ground line.',
        FINISH, LAST])
    wide = k in ('turtle', 'ram', 'cavalry', 'merchant', 'stonesq', 'boar')
    return [{'name': k + '_model', 'prompt': p, 'size': '1536x1024' if wide else '1024x1024', 'alpha': 'auto', 'ref': [{'path': ref, 'label': 'the original design of this character'}]}]

def frames_jobs(k):
    ref, desc, *_ = CHARS[k]; idle = f'art/gen/{k}_idle.png'
    if not os.path.exists(idle): sys.exit(f'{idle} is missing: the approved idle pose (phase poses) is the reference')
    jobs = []
    for action, (what, frames) in FRAMES[k].items():
        p = '\n'.join([
            'Use case: a FRAME-BY-FRAME ANIMATION SHEET (a 1970s hand-drawn animated film) for a top-down 3/4 survivors-like game set in a Gaulish village of 50 BC.',
            "Image 2 is the ORIGINAL DESIGN of this character and Image 3 his APPROVED pose in this game's style: every frame must be this exact character — the same face, "
            'headgear, hair, clothes, colours, line and proportions, at the same size as Image 3.',
            'Subject: ' + desc,
            'Draw the SAME character NINE times on one canvas in a 3×3 grid (read left to right, top to bottom), the WHOLE body in every frame, '
            'seen from the side in a 3/4 view, ALWAYS FACING RIGHT, every figure at EXACTLY the same scale, each centred in its cell:',
            '1) CALIBRATION: standing at rest exactly like Image 3;',
            *[f'{i + 2}) {t};' for i, t in enumerate(frames)],
            f'Frames 2–9 are {what}: consecutive drawings of one continuous motion, each only a small step from the one before, so they play smoothly in a loop.',
            'Very wide empty gaps between the figures, nothing touching or overlapping, nothing cut by the canvas edge.',
            FINISH,
            'Constraints: no text, no numbers, no frame borders, no grid lines, no ground, no shadows, no glow, no motion lines, no speed streaks, transparent background.'])
        jobs.append({'name': f'{k}_{action}_sheet', 'prompt': p, 'size': '1536x1536', 'alpha': 'auto',
                     'ref': [{'path': ref, 'label': 'the original design of this character'}, {'path': idle, 'label': 'his approved pose in this game (the size and look to keep)'}]})
    return jobs

if phase == 'a': jobs = [body_job(k) for k in CHARS] + [SWORD] + [prop_job(k) for k in PROPS]
elif phase == 'poses': jobs = [poses_job(k) for k in POSES]
elif phase == 'model': jobs = [j for k in {**HERO_CAST, **ENEMY_CAST} if not sys.argv[2:] or k in sys.argv[2:] for j in model_jobs(k)]
elif phase == 'frames': jobs = [j for k in FRAMES if (not sys.argv[2:] or k in sys.argv[2:]) and os.path.exists(f'art/gen/{k}_idle.png') for j in frames_jobs(k)]
elif phase == 'b': jobs = [j for k in CHARS for j in limb_jobs(k) if not sys.argv[2:] or any(w in j['name'] for w in sys.argv[2:])]
else: sys.exit('phase: a | b | poses | model | frames')
out = f'art/jobs_gaul_{phase}.json'
json.dump(jobs, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(out, len(jobs), 'jobs:', ' '.join(j['name'] for j in jobs))
