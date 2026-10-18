# Everyday citizen animations

Generated with built-in image_gen using each existing citizen's walk/0.png as the identity and art-style reference. One transparent sheet per citizen; four columns, three rows (talk, shop, rest), twelve poses per sheet.

Shared prompt: Same full-body character, costume and proportions as the reference, facing right in three-quarter view. Asterix-style hand-inked cartoon, bold dark outlines, warm flat colours and restrained cel shading. Keep feet planted and scale consistent. TALK: listening, hand lifted explaining, open-hand emphasis, returning to listening. SHOP: examining a coin, extending payment towards an invisible stall, inspecting a small purchase, settled holding pose. REST: relaxed stance, lowering shoulders, gentle stretch or sigh, returning upright. Each sequence has four distinct poses and loops. Generous transparent margins, complete head and feet, no scenery, grid, captions, cast shadows or other people.

Character prompts:
- citizen-0: plump baker, white cap and short-sleeved tunic/apron, red sash, brown sandals, round loaf.
- citizen-1: slim dark curly-haired porter, stubble and long nose, brown sleeveless tunic, green belt, brown sandals, pale sack over shoulder.
- citizen-2: older slender balding scribe, grey side hair, hooked nose, ochre tunic, burgundy cloak, brown sandals, parchment scroll.

Import with `node tools/import-expansion-art.cjs citizen-N <sheet.png>`. The importer preserves existing walking frames, applies one scale per citizen, and anchors the new poses at [128, 236] in individual 256 × 256 RGBA images. Existing city-life actions select the new looping frames automatically.
